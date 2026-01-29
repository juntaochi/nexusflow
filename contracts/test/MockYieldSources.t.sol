// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import "../src/NexusUSD.sol";
import "../src/MockAavePool.sol";
import "../src/MockComet.sol";

contract MockYieldSourcesTest is Test {
    NexusUSD private token;
    MockAavePool private aavePool;
    MockComet private comet;

    address private user = makeAddr("user");

    function setUp() public {
        token = new NexusUSD();
        aavePool = new MockAavePool();
        comet = new MockComet();

        token.transfer(user, 200 ether);
        aavePool.setLiquidityRate(address(token), uint128(3e25));
        comet.setRates(8e17, 1e9);
    }

    function testAaveSupplyWithdrawAndRate() public {
        vm.prank(user);
        token.approve(address(aavePool), 100 ether);

        vm.prank(user);
        aavePool.supply(address(token), 100 ether, user, 0);

        assertEq(aavePool.deposits(address(token), user), 100 ether);

        MockAavePool.ReserveData memory data = aavePool.getReserveData(address(token));
        assertEq(data.currentLiquidityRate, uint128(3e25));

        vm.prank(user);
        aavePool.withdraw(address(token), 40 ether, user);

        assertEq(aavePool.deposits(address(token), user), 60 ether);
        assertEq(token.balanceOf(user), 140 ether);
    }

    function testCometSupplyWithdrawAndRate() public {
        vm.prank(user);
        token.approve(address(comet), 80 ether);

        vm.prank(user);
        comet.supply(address(token), 80 ether);

        assertEq(comet.deposits(user), 80 ether);
        assertEq(comet.getUtilization(), 8e17);
        assertEq(comet.getSupplyRate(0), 1e9);

        vm.prank(user);
        comet.withdraw(address(token), 30 ether);

        assertEq(comet.deposits(user), 50 ether);
        assertEq(token.balanceOf(user), 150 ether);
    }
}
