// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./HederaTokenService.sol";

contract HederaTokenAuction {
    struct Bid {
        address bidder;
        uint256 amount;
        uint256 timestamp;
    }

    // Hedera Token Service interface instance
    HederaTokenService public hederaTokenService;
    address public immutable auctioneer;
    address public immutable token; // HTS token address (fungible)
    uint256 public immutable biddingEnd;
    uint256 public immutable biddingFee; // fee in token units

    bool public ended;
    address public highestBidder;
    uint256 public highestBid;

    Bid[] private bids;
    mapping(address => bool) private hasBid;

    event NewBid(address indexed bidder, uint256 amount, uint256 timestamp, string hederaTopicMessage);
    event AuctionEnded(address winner, uint256 amount, string hederaTopicMessage);

    int private constant RESPONSE_SUCCESS = 22; // Hedera SDK success code

    modifier onlyBeforeEnd() {
        require(block.timestamp < biddingEnd, "Auction ended");
        _;
    }

    modifier onlyAfterEnd() {
        require(block.timestamp >= biddingEnd, "Auction not yet ended");
        _;
    }

    constructor(
        address _hederaTokenService,
        address _token,
        uint256 _biddingFee,
        uint256 _biddingTimeSeconds
    ) {
        require(_hederaTokenService != address(0), "Invalid HTS contract address");
        require(_token != address(0), "Invalid token address");
        require(_biddingTimeSeconds > 0, "Bidding time must be positive");

        hederaTokenService = HederaTokenService(_hederaTokenService);
        auctioneer = msg.sender;
        token = _token;
        biddingFee = _biddingFee;
        biddingEnd = block.timestamp + _biddingTimeSeconds;
    }

    function placeBid(int64 bidAmount) external onlyBeforeEnd {
        require(msg.sender != auctioneer, "Auctioneer can't bid");
        require(!hasBid[msg.sender], "Bidder already participated");
        require(uint64(bidAmount) > highestBid, "Bid not high enough");
        require(bidAmount > 0, "Bid must be positive");

        // Transfer bidding fee to auctioneer (non-refundable)
        int responseFee = hederaTokenService.transferToken(token, msg.sender, auctioneer, safeConvertToInt64(biddingFee));
        require(responseFee == RESPONSE_SUCCESS, "Fee transfer failed");

        // Transfer bid amount from bidder to contract (escrow)
        int responseBid = hederaTokenService.transferToken(token, msg.sender, address(this), bidAmount);
        require(responseBid == RESPONSE_SUCCESS, "Bid transfer failed");

        bids.push(Bid(msg.sender, uint256(bidAmount), block.timestamp));
        hasBid[msg.sender] = true;
        highestBid = uint256(bidAmount);
        highestBidder = msg.sender;

        emit NewBid(
            msg.sender,
            uint256(bidAmount),
            block.timestamp,
            string(abi.encodePacked("Bidder: ", toAsciiString(msg.sender), " Amount: ", uint2str(uint256(bidAmount)), " Time: ", uint2str(block.timestamp)))
        );
    }

    function endAuction() external onlyAfterEnd {
        require(!ended, "Auction already ended");
        ended = true;

        if (highestBid > 0) {
            int res = hederaTokenService.transferToken(token, address(this), auctioneer, safeConvertToInt64(highestBid));
            require(res == RESPONSE_SUCCESS, "Payout failed");
        }

        emit AuctionEnded(
            highestBidder,
            highestBid,
            string(abi.encodePacked("Winner: ", toAsciiString(highestBidder), " Bid: ", uint2str(highestBid)))
        );
    }

    function getAllBids() external view returns (Bid[] memory) {
        return bids;
    }

    // Helper function to safely convert uint256 to int64
    function safeConvertToInt64(uint256 value) internal pure returns (int64) {
        require(value <= uint256(type(int64).max), "Value too large for int64");
        return int64(value);
    }

    // Helpers to convert address and uint to strings for event messages
    function toAsciiString(address x) internal pure returns (string memory) {
        bytes memory s = new bytes(42);
        bytes memory hexChars = "0123456789abcdef";
        s[0] = '0';
        s[1] = 'x';
        for (uint i = 0; i < 20; i++) {
            s[2 + i * 2] = hexChars[uint(uint8(uint160(x) / (2**(8*(19 - i))) >> 4))];
            s[3 + i * 2] = hexChars[uint(uint8(uint160(x) / (2**(8*(19 - i)))) & 0x0f)];
        }
        return string(s);
    }

    function uint2str(uint v) internal pure returns (string memory str) {
        if (v == 0) return "0";
        uint maxLength = 100;
        bytes memory reversed = new bytes(maxLength);
        uint i = 0;
        while (v != 0 && i < maxLength) {
            uint remainder = v % 10;
            v = v / 10;
            reversed[i++] = bytes1(uint8(48 + remainder));
        }
        bytes memory s = new bytes(i);
        for (uint j = 0; j < i; j++) {
            s[j] = reversed[i - j - 1];
        }
        return string(s);
    }
}