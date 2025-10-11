use starknet::ContractAddress;

#[starknet::interface]
trait IWorkProof<TContractState> {
    // Admin management
    fn add_admin(ref self: TContractState, new_admin: ContractAddress);
    fn remove_admin(ref self: TContractState, admin_to_remove: ContractAddress);
    
    // Submission management
    fn create_submission(
        ref self: TContractState,
        task_id: felt252,
        result_hash: felt252,
        storage_uri: felt252
    ) -> felt252;
    fn approve_submission(ref self: TContractState, submission_id: felt252);
    fn reject_submission(ref self: TContractState, submission_id: felt252);
    
    // View functions
    fn is_submission_approved(ref self: TContractState, submission_id: felt252) -> bool;
    fn get_user_reputation(ref self: TContractState, user_address: ContractAddress) -> u256;
    fn is_admin(ref self: TContractState, address: ContractAddress) -> bool;
    fn get_admin(ref self: TContractState) -> ContractAddress;
    fn get_submission_count(ref self: TContractState) -> u256;
    fn get_contract_info(ref self: TContractState) -> (felt252, felt252);
}

#[starknet::contract]
mod work_proof {
    use starknet::ContractAddress;
    use starknet::get_caller_address;
    use starknet::storage::StoragePointerReadAccess;
    use starknet::storage::StoragePointerWriteAccess;

    // Storage structure
    #[storage]
    struct Storage {
        // Admin management
        admin: ContractAddress,
        
        // Submission management
        submission_count: felt252,
        
        // Contract metadata
        contract_name: felt252,
        contract_version: felt252,
    }

    // Events
    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        SubmissionCreated: SubmissionCreated,
        SubmissionApproved: SubmissionApproved,
        SubmissionRejected: SubmissionRejected,
        AdminAdded: AdminAdded,
        AdminRemoved: AdminRemoved,
        ReputationUpdated: ReputationUpdated,
    }

    #[derive(Drop, starknet::Event)]
    struct SubmissionCreated {
        submission_id: felt252,
        user_address: ContractAddress,
        task_id: felt252,
    }

    #[derive(Drop, starknet::Event)]
    struct SubmissionApproved {
        submission_id: felt252,
        user_address: ContractAddress,
        approved_by: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    struct SubmissionRejected {
        submission_id: felt252,
        user_address: ContractAddress,
        rejected_by: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    struct AdminAdded {
        admin_address: ContractAddress,
        added_by: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    struct AdminRemoved {
        admin_address: ContractAddress,
        removed_by: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    struct ReputationUpdated {
        user_address: ContractAddress,
        old_reputation: u256,
        new_reputation: u256,
    }

    // Constructor
    #[constructor]
    fn constructor(ref self: ContractState, admin: ContractAddress) {
        // Set initial admin
        self.admin.write(admin);
        
        // Set contract metadata
        self.contract_name.write('WorkProof');
        self.contract_version.write('1.0.0');
        
        // Initialize submission count
        self.submission_count.write(0);
    }

    // External functions implementation
    #[external(v0)]
    impl WorkProofImpl of super::IWorkProof<ContractState> {
        // Admin management functions
        fn add_admin(ref self: ContractState, new_admin: ContractAddress) {
            let caller = get_caller_address();
            self._assert_admin(caller);
            
            self.emit(AdminAdded {
                admin_address: new_admin,
                added_by: caller,
            });
        }
        
        fn remove_admin(ref self: ContractState, admin_to_remove: ContractAddress) {
            let caller = get_caller_address();
            self._assert_admin(caller);
            
            // Prevent removing the primary admin
            let primary_admin = self.admin.read();
            assert(admin_to_remove != primary_admin, 'Cannot remove primary admin');
            
            self.emit(AdminRemoved {
                admin_address: admin_to_remove,
                removed_by: caller,
            });
        }
        
        // Submission management functions
        fn create_submission(
            ref self: ContractState,
            task_id: felt252,
            result_hash: felt252,
            storage_uri: felt252
        ) -> felt252 {
            let caller = get_caller_address();
            
            // Generate submission ID
            let submission_count = self.submission_count.read();
            let submission_id = submission_count + 1;
            self.submission_count.write(submission_id);
            
            // Emit event
            self.emit(SubmissionCreated {
                submission_id,
                user_address: caller,
                task_id,
            });
            
            submission_id
        }
        
        fn approve_submission(ref self: ContractState, submission_id: felt252) {
            let caller = get_caller_address();
            self._assert_admin(caller);
            
            // Emit events
            self.emit(SubmissionApproved {
                submission_id,
                user_address: caller,
                approved_by: caller,
            });
            
            self.emit(ReputationUpdated {
                user_address: caller,
                old_reputation: 0,
                new_reputation: 10,
            });
        }
        
        fn reject_submission(ref self: ContractState, submission_id: felt252) {
            let caller = get_caller_address();
            self._assert_admin(caller);
            
            // Emit event
            self.emit(SubmissionRejected {
                submission_id,
                user_address: caller,
                rejected_by: caller,
            });
        }
        
        // View functions
        fn is_submission_approved(ref self: ContractState, submission_id: felt252) -> bool {
            false
        }
        
        fn get_user_reputation(ref self: ContractState, user_address: ContractAddress) -> u256 {
            0
        }
        
        fn is_admin(ref self: ContractState, address: ContractAddress) -> bool {
            address == self.admin.read()
        }
        
        fn get_admin(ref self: ContractState) -> ContractAddress {
            self.admin.read()
        }
        
        fn get_submission_count(ref self: ContractState) -> u256 {
            let count = self.submission_count.read();
            count.try_into().unwrap()
        }
        
        fn get_contract_info(ref self: ContractState) -> (felt252, felt252) {
            let name = self.contract_name.read();
            let version = self.contract_version.read();
            (name, version)
        }
    }

    // Internal helper functions
    #[generate_trait]
    impl InternalImpl of InternalTrait {
        fn _assert_admin(ref self: ContractState, caller: ContractAddress) {
            let admin = self.admin.read();
            assert(caller == admin, 'Caller is not admin');
        }
    }
}
