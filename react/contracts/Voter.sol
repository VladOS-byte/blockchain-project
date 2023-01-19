pragma solidity ^0.8.0;

import { ERC20 } from "openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Voter {

    uint64 constant delay = 3 * 86400;
    uint64 constant check_delay = 3600;

    event Receive(string data);

    event Gained(string data);

    event Discard(string data);

    struct Proposal {
        string data;
        uint256 ttl;
        bool discarded;
        Voice[] voices;
    }

    struct Voice {
        address user;
        uint256 amount;
        bool isFor;
    }

    ERC20 public immutable token;

    mapping(uint256 => Proposal) proposals;
    uint256[] propIndexes;
    uint256 last_check = 0;
    uint256 last_index = 0;

    constructor(ERC20 _token) 
    {
        token = _token;
    }

    /// Propose some proposal
    /// @param _data information of proposal
    /// 
    function propose(string memory _data) 
        public 
    {
        checkAllProposalsDiscard();

        last_index++;
        proposals[last_index].data = _data;
        proposals[last_index].ttl = block.timestamp + delay;
        proposals[last_index].discarded = false;
        propIndexes.push(last_index);
    }

    /// Vote for some proposal from some user
    /// @param _key target proposal
    /// @param _isFor option of voice
    /// 
    function vote(uint256 _key, bool _isFor) 
        public
    {
        checkAllProposalsDiscard();

        uint256 _amount = token.balanceOf(msg.sender);

        require(token.balanceOf(msg.sender) >= _amount, "Sender's amount more then sender's balance");
        
        Proposal storage proposal = proposals[_key];

        require(proposal.ttl > 0, "No such proposal.");

        for (uint j = 0; j < proposal.voices.length; j++) {
            require(proposal.voices[j].user != msg.sender, "User have been already voted.");
        }

        proposal.voices.push(Voice(msg.sender, _amount, _isFor));

        uint256 summaryFor = getVotesForAmount(_key);
        uint256 summaryGain = getVotesGainAmount(_key);

        uint256 t = token.totalSupply();
        if (2 * summaryFor > t) {
            proposal.discarded = true;
            // emit Receive(proposal.data);
        } else if (2 * summaryGain > t) {
            proposal.discarded = true;
            // emit Gained(proposal.data);
        }
    }

    /// Check if some proposal has been already discarded or proposal time is over
    /// 
    /// 
    function checkAllProposalsDiscard() 
        internal
    {
        if (block.timestamp - last_check > check_delay) {
            uint i = 0;

            while (i < propIndexes.length) {
                Proposal storage proposal = proposals[propIndexes[i]];
                if (checkProposalDiscard(proposal)) {
                    // delete proposals[propIndexes[i]];
                    // delete propIndexes[i];
                    i++;
                } else {
                    i++;
                }
            }

            last_check = block.timestamp;
        }
    }

    /// Check if proposal has been already discarded or proposal time is over
    /// @param proposal target proposal for checking
    /// @return true if target proposal has been already discarded, false otherwise
    function checkProposalDiscard(Proposal storage proposal) 
        internal 
        returns (bool) 
    {
        if (proposal.discarded) {
            return true;
        } else if (proposal.ttl <= block.timestamp) {
            proposal.discarded = true;
            // emit Discard(proposal.data);
            return true;
        }

        return false;
    }

    /// Check if contract ready for proposation
    /// 
    /// @return true if some proposal has been already discarded, false otherwise
    function readyForPropose() 
        public
        pure
        returns (bool) 
    {
        return true;
    }

    /// Get FOR votes for proposal
    /// @param _key proposal
    /// @return total amount of FOR voices
    function getVotesForAmount(uint256 _key) 
        public
        view
        returns (uint256)
    {
        return getVotesAmount(_key, true);
    }

    /// Get GAIN votes for proposal
    /// @param _key proposal
    /// @return total amount of GAIN voices
    function getVotesGainAmount(uint256 _key) 
        public
        view
        returns (uint256)
    {
        return getVotesAmount(_key, false);
    }

    /// Get votes for proposal
    /// @param _key proposal
    /// @param _isFor true if need 'FOR' voices, false - 'GAIN'
    /// @return total amount of voices
    function getVotesAmount(uint256 _key, bool _isFor) 
        internal
        view
        returns (uint256)
    {
        uint256 summary = 0;

        Proposal memory proposal = proposals[_key];
        if (!proposal.discarded && proposal.ttl > block.timestamp) {
            for (uint j = 0; j < proposal.voices.length; j++) {
                Voice memory v = proposal.voices[j];

                uint256 a = v.amount;
                uint256 b = token.balanceOf(v.user);
                if (a > b) {
                    a = b;
                }

                if (v.isFor == _isFor) {
                    summary += a;
                }
            }
        }

        return summary;
    }

    /// Get proposals keys
    /// @param from (=msg.sender)
    /// @return array of actual proposals keys
    function getProposalsF(address from) 
        public  
        view
        returns (uint256[] memory, string[] memory, bool[] memory) 
    {
        uint256[] memory tmp = new uint256[](propIndexes.length);
        uint i = 0;
        uint len = 0;

        while (i < propIndexes.length) {
            Proposal memory proposal = proposals[propIndexes[i]];
            if (!proposal.discarded && proposal.ttl > block.timestamp) {
                tmp[len] = propIndexes[i];
                len++;
            }
            i++;
        }

        uint256[] memory keys = new uint256[](len);
        string[] memory datas = new string[](len);
        bool[] memory voteds = new bool[](len);

        for (i = 0; i < len; i++) {
            Proposal storage proposal = proposals[tmp[i]];
            keys[i] = tmp[i];
            datas[i] = proposal.data;

            bool voted = false;
            for (uint j = 0; j < proposal.voices.length; j++) {
                if (proposal.voices[j].user == from) {
                    voted = true;
                    break;
                }
            }

            voteds[i] = voted;
        }

        return (keys, datas, voteds);
    }


    /// Get proposals data
    /// @param keys target proposals
    /// @return array of actual proposals data
    function getProposalsData(uint256[] memory keys) 
        public  
        view
        returns (string[] memory) 
    {
        string[] memory res = new string[](keys.length);

        for (uint i = 0; i < keys.length; i++) {
            res[i] = proposals[keys[i]].data;
        }

        return res;
    }


}