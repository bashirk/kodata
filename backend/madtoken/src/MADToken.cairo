use starknet::ContractAddress;

#[starknet::interface]
trait IMADToken<TContractState> {
    fn name(ref self: TContractState) -> felt252;
    fn symbol(ref self: TContractState) -> felt252;
    fn decimals(ref self: TContractState) -> u8;
    fn total_supply(ref self: TContractState) -> u256;
    fn balance_of(ref self: TContractState, account: ContractAddress) -> u256;
    fn transfer(ref self: TContractState, recipient: ContractAddress, amount: u256) -> bool;
    fn mint(ref self: TContractState, to: ContractAddress, amount: u256);
    fn get_token_info(ref self: TContractState) -> (felt252, felt252, u8, u256);
}

#[starknet::contract]
mod madtoken {
    use starknet::ContractAddress;
    use starknet::get_caller_address;
    use starknet::get_block_timestamp;
    use starknet::storage::StoragePointerReadAccess;
    use starknet::storage::StoragePointerWriteAccess;

    // Storage structure
    #[storage]
    struct Storage {
        name: felt252,
        symbol: felt252,
        decimals: u8,
        total_supply: u256,
        owner: ContractAddress,
        owner_balance: u256,
    }

    // Events
    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        Transfer: Transfer,
        TokensMinted: TokensMinted,
    }

    #[derive(Drop, starknet::Event)]
    struct Transfer {
        #[key]
        from: ContractAddress,
        #[key]
        to: ContractAddress,
        value: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct TokensMinted {
        #[key]
        to: ContractAddress,
        amount: u256,
        timestamp: u64,
    }

    // Constructor
    #[constructor]
    fn constructor(
        ref self: ContractState,
        owner: ContractAddress,
        name: felt252,
        symbol: felt252,
        decimals: u8,
        initial_supply: u256,
    ) {
        self.name.write(name);
        self.symbol.write(symbol);
        self.decimals.write(decimals);
        self.owner.write(owner);
        self.total_supply.write(initial_supply);
        self.owner_balance.write(initial_supply);
        
        self.emit(Transfer {
            from: starknet::contract_address_const::<0>(),
            to: owner,
            value: initial_supply,
        });
    }

    // Implementation
    #[abi(embed_v0)]
    impl MADTokenImpl of super::IMADToken<ContractState> {
        fn name(ref self: ContractState) -> felt252 {
            self.name.read()
        }

        fn symbol(ref self: ContractState) -> felt252 {
            self.symbol.read()
        }

        fn decimals(ref self: ContractState) -> u8 {
            self.decimals.read()
        }

        fn total_supply(ref self: ContractState) -> u256 {
            self.total_supply.read()
        }

        fn balance_of(ref self: ContractState, account: ContractAddress) -> u256 {
            let owner = self.owner.read();
            if account == owner {
                self.owner_balance.read()
            } else {
                0 // For simplicity, only owner has balance
            }
        }

        fn transfer(ref self: ContractState, recipient: ContractAddress, amount: u256) -> bool {
            let sender = get_caller_address();
            let owner = self.owner.read();
            assert(sender == owner, 'Only owner can transfer');
            
            let current_balance = self.owner_balance.read();
            assert(current_balance >= amount, 'Insufficient balance');
            
            self.owner_balance.write(current_balance - amount);
            
            self.emit(Transfer {
                from: sender,
                to: recipient,
                value: amount,
            });
            
            true
        }

        fn mint(ref self: ContractState, to: ContractAddress, amount: u256) {
            let caller = get_caller_address();
            let owner = self.owner.read();
            assert(caller == owner, 'Only owner can mint');
            
            let current_balance = self.owner_balance.read();
            self.owner_balance.write(current_balance + amount);
            
            let current_supply = self.total_supply.read();
            self.total_supply.write(current_supply + amount);
            
            self.emit(Transfer {
                from: starknet::contract_address_const::<0>(),
                to,
                value: amount,
            });
            
            self.emit(TokensMinted {
                to,
                amount,
                timestamp: get_block_timestamp(),
            });
        }

        fn get_token_info(ref self: ContractState) -> (felt252, felt252, u8, u256) {
            (
                self.name.read(),
                self.symbol.read(),
                self.decimals.read(),
                self.total_supply.read()
            )
        }
    }
}