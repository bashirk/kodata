%lang starknet

use starknet::ContractAddress;
use starknet::get_caller_address;
use starknet::get_contract_address;
use starknet::storage::StorageMap;
use starknet::storage::StorageMapAccess;
use starknet::storage::StorageMapRead;
use starknet::storage::StorageMapWrite;
use starknet::storage::StorageRead;
use starknet::storage::StorageWrite;

// Import MAD token interface
use starknet::interface::IMADTokenDispatcher;

// Storage structure
#[storage]
struct Storage {
    // Admin management
    admin: ContractAddress,
    is_admin: Map<ContractAddress, bool>,
    
    // Submission management
    submissions: Map<felt252, Submission>,
    submission_count: u256,
    
    // User reputation
    user_reputation: Map<ContractAddress, u256>,
    
    // MAD token integration
    mad_token_contract: ContractAddress,
    submission_reward_amount: u256,
    approval_reward_amount: u256,
    
    // Contract metadata
    contract_name: felt252,
    contract_version: felt252,
}

// Submission data structure
#[derive(Drop, Serde, starknet::Store)]
struct Submission {
    id: felt252,
    user_address: ContractAddress,
    task_id: felt252,
    result_hash: felt252,
    storage_uri: felt252,
    status: SubmissionStatus,
    created_at: u64,
    approved_at: u64,
    approved_by: ContractAddress,
}

// Submission status enum
#[derive(Drop, Serde, starknet::Store)]
enum SubmissionStatus {
    Pending,
    Approved,
    Rejected,
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
fn constructor(
    ref syscall_ptr: *mut syscall::SyscallPtr,
    admin: ContractAddress,
    mad_token_contract: ContractAddress
) {
    let storage = storage::StorageTrait::new(syscall_ptr);
    
    // Set initial admin
    storage::write(storage.admin, admin);
    storage::write(storage.is_admin, admin, true);
    
    // Set MAD token contract and reward amounts
    storage::write(storage.mad_token_contract, mad_token_contract);
    storage::write(storage.submission_reward_amount, 1000000000000000000); // 1 MAD token (18 decimals)
    storage::write(storage.approval_reward_amount, 500000000000000000); // 0.5 MAD token
    
    // Set contract metadata
    storage::write(storage.contract_name, 'WorkProof');
    storage::write(storage.contract_version, '1.0.0');
    
    // Initialize submission count
    storage::write(storage.submission_count, 0);
}

// External functions implementation
#[external(v0)]
impl WorkProofImpl of IWorkProof<ContractState> {
    // Admin management functions
    fn add_admin(ref self: ContractState, new_admin: ContractAddress) {
        let caller = get_caller_address();
        self._assert_admin(caller);
        
        let storage = self.0;
        storage::write(storage.is_admin, new_admin, true);
        
        self.emit(SubmissionCreated {
            submission_id: 0,
            user_address: new_admin,
            task_id: 0,
        });
    }
    
    fn remove_admin(ref self: ContractState, admin_to_remove: ContractAddress) {
        let caller = get_caller_address();
        self._assert_admin(caller);
        
        // Prevent removing the primary admin
        let primary_admin = self.admin.read();
        assert(admin_to_remove != primary_admin, 'Cannot remove primary admin');
        
        let storage = self.0;
        storage::write(storage.is_admin, admin_to_remove, false);
        
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
        let storage = self.0;
        
        // Generate submission ID
        let submission_count = storage::read(storage.submission_count);
        let submission_id = submission_count + 1;
        storage::write(storage.submission_count, submission_id);
        
        // Create submission
        let submission = Submission {
            id: submission_id,
            user_address: caller,
            task_id,
            result_hash,
            storage_uri,
            status: SubmissionStatus::Pending,
            created_at: starknet::get_block_timestamp(),
            approved_at: 0,
            approved_by: starknet::contract_address_const::<0>(),
        };
        
        // Store submission
        storage::write(storage.submissions, submission_id, submission);
        
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
        
        let storage = self.0;
        let mut submission = storage::read(storage.submissions, submission_id);
        
        // Check if submission exists and is pending
        assert(submission.status == SubmissionStatus::Pending, 'Submission not pending');
        
        // Update submission status
        submission.status = SubmissionStatus::Approved;
        submission.approved_at = starknet::get_block_timestamp();
        submission.approved_by = caller;
        
        // Store updated submission
        storage::write(storage.submissions, submission_id, submission);
        
        // Update user reputation
        let user_address = submission.user_address;
        let current_reputation = storage::read(storage.user_reputation, user_address);
        let new_reputation = current_reputation + 10; // Award 10 reputation points
        storage::write(storage.user_reputation, user_address, new_reputation);
        
        // Distribute MAD token rewards
        let mad_token_contract = storage::read(storage.mad_token_contract);
        let submission_reward = storage::read(storage.submission_reward_amount);
        let approval_reward = storage::read(storage.approval_reward_amount);
        
        // Distribute reward to submitter
        let mad_token_dispatcher = IMADTokenDispatcher { contract_address: mad_token_contract };
        mad_token_dispatcher.distribute_submission_reward(user_address, submission_reward, submission_id);
        
        // Distribute reward to approver
        mad_token_dispatcher.distribute_approval_reward(caller, approval_reward, submission_id);
        
        // Emit events
        self.emit(SubmissionApproved {
            submission_id,
            user_address,
            approved_by: caller,
        });
        
        self.emit(ReputationUpdated {
            user_address,
            old_reputation: current_reputation,
            new_reputation,
        });
    }
    
    fn reject_submission(ref self: ContractState, submission_id: felt252) {
        let caller = get_caller_address();
        self._assert_admin(caller);
        
        let storage = self.0;
        let mut submission = storage::read(storage.submissions, submission_id);
        
        // Check if submission exists and is pending
        assert(submission.status == SubmissionStatus::Pending, 'Submission not pending');
        
        // Update submission status
        submission.status = SubmissionStatus::Rejected;
        submission.approved_at = starknet::get_block_timestamp();
        submission.approved_by = caller;
        
        // Store updated submission
        storage::write(storage.submissions, submission_id, submission);
        
        // Emit event
        self.emit(SubmissionRejected {
            submission_id,
            user_address: submission.user_address,
            rejected_by: caller,
        });
    }
    
    // View functions
    fn get_submission(ref self: ContractState, submission_id: felt252) -> Submission {
        let storage = self.0;
        storage::read(storage.submissions, submission_id)
    }
    
    fn is_submission_approved(ref self: ContractState, submission_id: felt252) -> bool {
        let storage = self.0;
        let submission = storage::read(storage.submissions, submission_id);
        submission.status == SubmissionStatus::Approved
    }
    
    fn get_user_reputation(ref self: ContractState, user_address: ContractAddress) -> u256 {
        let storage = self.0;
        storage::read(storage.user_reputation, user_address)
    }
    
    fn is_admin(ref self: ContractState, address: ContractAddress) -> bool {
        let storage = self.0;
        storage::read(storage.is_admin, address)
    }
    
    fn get_admin(ref self: ContractState) -> ContractAddress {
        let storage = self.0;
        storage::read(storage.admin)
    }
    
    fn get_submission_count(ref self: ContractState) -> u256 {
        let storage = self.0;
        storage::read(storage.submission_count)
    }
    
    fn get_contract_info(ref self: ContractState) -> (felt252, felt252) {
        let storage = self.0;
        let name = storage::read(storage.contract_name);
        let version = storage::read(storage.contract_version);
        (name, version)
    }
    
    // MAD token integration functions
    fn set_mad_token_contract(ref self: ContractState, mad_token_contract: ContractAddress) {
        let caller = get_caller_address();
        self._assert_admin(caller);
        
        let storage = self.0;
        storage::write(storage.mad_token_contract, mad_token_contract);
    }
    
    fn set_submission_reward_amount(ref self: ContractState, amount: u256) {
        let caller = get_caller_address();
        self._assert_admin(caller);
        
        let storage = self.0;
        storage::write(storage.submission_reward_amount, amount);
    }
    
    fn set_approval_reward_amount(ref self: ContractState, amount: u256) {
        let caller = get_caller_address();
        self._assert_admin(caller);
        
        let storage = self.0;
        storage::write(storage.approval_reward_amount, amount);
    }
    
    fn get_mad_token_contract(ref self: ContractState) -> ContractAddress {
        let storage = self.0;
        storage::read(storage.mad_token_contract)
    }
    
    fn get_submission_reward_amount(ref self: ContractState) -> u256 {
        let storage = self.0;
        storage::read(storage.submission_reward_amount)
    }
    
    fn get_approval_reward_amount(ref self: ContractState) -> u256 {
        let storage = self.0;
        storage::read(storage.approval_reward_amount)
    }
}

// Internal helper functions
#[generate_trait]
impl InternalImpl of InternalTrait {
    fn _assert_admin(ref self: ContractState, caller: ContractAddress) {
        let storage = self.0;
        let is_admin = storage::read(storage.is_admin, caller);
        assert(is_admin, 'Caller is not admin');
    }
}

// Interface definition
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
    fn get_submission(ref self: TContractState, submission_id: felt252) -> Submission;
    fn is_submission_approved(ref self: TContractState, submission_id: felt252) -> bool;
    fn get_user_reputation(ref self: TContractState, user_address: ContractAddress) -> u256;
    fn is_admin(ref self: TContractState, address: ContractAddress) -> bool;
    fn get_admin(ref self: TContractState) -> ContractAddress;
    fn get_submission_count(ref self: TContractState) -> u256;
    fn get_contract_info(ref self: TContractState) -> (felt252, felt252);
    
    // MAD token integration functions
    fn set_mad_token_contract(ref self: TContractState, mad_token_contract: ContractAddress);
    fn set_submission_reward_amount(ref self: TContractState, amount: u256);
    fn set_approval_reward_amount(ref self: TContractState, amount: u256);
    fn get_mad_token_contract(ref self: TContractState) -> ContractAddress;
    fn get_submission_reward_amount(ref self: TContractState) -> u256;
    fn get_approval_reward_amount(ref self: TContractState) -> u256;
}
