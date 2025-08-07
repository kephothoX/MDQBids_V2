// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract HederaAuction is Ownable, Pausable {
    IERC20 public paymentToken;

    struct Auction {
        uint256 entryFee;
        uint256 highestBid;
        address highestBidder;
        uint256 startTime;
        uint256 endTime;
        uint256 minBidIncrement;
        bool ended;
    }

    struct Participant {
        bool entered;
        uint256 totalBid;
        bool withdrawn;
    }

    mapping(uint256 => Auction) public auctions;
    mapping(uint256 => address[]) public auctionParticipants;
    mapping(uint256 => mapping(address => Participant)) public participants;
    uint256 public auctionCount;

    event AuctionCreated(uint256 auctionId, uint256 startTime, uint256 endTime);
    event BidPlaced(uint256 auctionId, address bidder, uint256 amount);
    event AuctionEnded(uint256 auctionId, address winner, uint256 amount);
    event EntryPaid(uint256 auctionId, address participant);
    event BidWithdrawn(uint256 auctionId, address bidder, uint256 amount);
    event EmergencyWithdraw(address owner, uint256 amount);

    constructor(address _tokenAddress) Ownable(_tokenAddress)  {
        paymentToken = IERC20(_tokenAddress);
    }

    function createAuction(
        uint256 _entryFee,
        uint256 _durationInSeconds,
        uint256 _minBidIncrement
    ) external onlyOwner whenNotPaused {
        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + _durationInSeconds;

        auctions[auctionCount] = Auction({
            entryFee: _entryFee,
            highestBid: 0,
            highestBidder: address(0),
            startTime: startTime,
            endTime: endTime,
            minBidIncrement: _minBidIncrement,
            ended: false
        });

        emit AuctionCreated(auctionCount, startTime, endTime);
        auctionCount++;
    }

    function enterAuction(uint256 _auctionId) external whenNotPaused {
        Auction storage auction = auctions[_auctionId];
        require(block.timestamp >= auction.startTime, "Auction not started");
        require(block.timestamp < auction.endTime, "Auction ended");
        require(
            !participants[_auctionId][msg.sender].entered,
            "Already participated"
        );

        paymentToken.transferFrom(msg.sender, address(this), auction.entryFee);

        participants[_auctionId][msg.sender] = Participant({
            entered: true,
            totalBid: 0,
            withdrawn: false
        });

        auctionParticipants[_auctionId].push(msg.sender);
        emit EntryPaid(_auctionId, msg.sender);
    }

    function placeBid(uint256 _auctionId, uint256 _amount)
        external
        whenNotPaused
    {
        Auction storage auction = auctions[_auctionId];
        require(
            participants[_auctionId][msg.sender].entered,
            "Must pay entry fee first"
        );
        require(block.timestamp >= auction.startTime, "Auction not started");
        require(block.timestamp < auction.endTime, "Auction ended");
        require(
            _amount >= auction.highestBid + auction.minBidIncrement,
            "Bid must be higher than current highest by min increment"
        );

        paymentToken.transferFrom(msg.sender, address(this), _amount);

        participants[_auctionId][msg.sender].totalBid += _amount;
        auction.highestBid = _amount;
        auction.highestBidder = msg.sender;

        emit BidPlaced(_auctionId, msg.sender, _amount);
    }

    function withdrawBid(uint256 _auctionId) external whenNotPaused {
        Auction storage auction = auctions[_auctionId];
        Participant storage participant = participants[_auctionId][msg.sender];

        require(block.timestamp < auction.endTime, "Auction ended");
        require(participant.entered, "Not a participant");
        require(participant.totalBid > 0, "No bid to withdraw");
        require(
            msg.sender != auction.highestBidder,
            "Highest bidder cannot withdraw"
        );

        uint256 amountToReturn = participant.totalBid;
        participant.totalBid = 0;
        participant.withdrawn = true;

        paymentToken.transfer(msg.sender, amountToReturn);
        emit BidWithdrawn(_auctionId, msg.sender, amountToReturn);
    }

    function endAuction(uint256 _auctionId) external whenNotPaused {
        Auction storage auction = auctions[_auctionId];
        require(block.timestamp >= auction.endTime, "Auction not ended");
        require(!auction.ended, "Auction already ended");

        auction.ended = true;

        // Transfer entry fees to owner (except winner's)
        for (uint256 i = 0; i < auctionParticipants[_auctionId].length; i++) {
            address participant = auctionParticipants[_auctionId][i];
            if (
                participant != auction.highestBidder &&
                !participants[_auctionId][participant].withdrawn
            ) {
                paymentToken.transfer(owner(), auction.entryFee);
            }
        }

        // Transfer winning bid amount to owner
        if (auction.highestBidder != address(0)) {
            paymentToken.transfer(owner(), auction.highestBid);
        }

        emit AuctionEnded(
            _auctionId,
            auction.highestBidder,
            auction.highestBid
        );
    }

    // Emergency functions
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function emergencyWithdraw() external onlyOwner whenPaused {
        uint256 balance = paymentToken.balanceOf(address(this));
        paymentToken.transfer(owner(), balance);
        emit EmergencyWithdraw(owner(), balance);
    }

    // Additional view functions
    function getAuctionParticipants(uint256 _auctionId)
        external
        view
        returns (address[] memory)
    {
        return auctionParticipants[_auctionId];
    }

    function getParticipantInfo(uint256 _auctionId, address _participant)
        external
        view
        returns (Participant memory)
    {
        return participants[_auctionId][_participant];
    }
}
