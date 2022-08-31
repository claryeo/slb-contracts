// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

contract IoT_Device{
    
    mapping(string => address) deviceOwner;

    event RegisteredDevice(string id, address owner);

    //included impact data arguments
    function hash(
        string memory _id,
        address _addr,
        uint256 _impactData_1, 
        uint256 _impactData_2, 
        uint256 _impactData_3
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_id, _addr, _impactData_1, _impactData_2, _impactData_3));
    }

    //Registration find function
    function findDeviceOwner(string memory _id) public view returns (address) {
        return (deviceOwner[_id]);
    }


    //Pebble setFirmware function
    //Registration setOwner function
    function registerDevice(string memory _id) public {
        address owner = findDeviceOwner(_id);
        require(owner != msg.sender, "device is registered");
        deviceOwner[_id] = msg.sender;
        
        emit RegisteredDevice(_id, msg.sender);
    }

    //Pebble recover function
    // included impact data arguments
    function checkDevice(
        string memory _id,
        bytes32 _signature,
        uint256 _impactData_1, 
        uint256 _impactData_2, 
        uint256 _impactData_3
    )  public view returns (bool){
        address owner = findDeviceOwner(_id);
        require(owner == msg.sender, "caller is not owner");
        if(hash(_id, msg.sender, _impactData_1, _impactData_2, _impactData_3) == _signature){
            return true;
        }
        else{
            return false;
        }
    }

}