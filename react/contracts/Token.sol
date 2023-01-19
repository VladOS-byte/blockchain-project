pragma solidity ^0.8.0;

import "openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {

    constructor(
        string memory _name,
        string memory _symbol
    )
        public ERC20(_name, _symbol)
    {
        _mint(msg.sender, 100);
    }

    /// Get count of sign after coma
    /// 
    /// @return count of sign after coma
    function decimals() 
    	public 
    	view  
    	override 
    	returns (uint8) {
        return 6;
    }
}