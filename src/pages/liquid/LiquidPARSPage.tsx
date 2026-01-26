import {
  Box,
  Container,
  Flex,
  Grid,
  GridItem,
  HStack,
  VStack,
  Text,
  Icon,
  Badge,
  Progress,
  Button,
  Input,
  InputGroup,
  InputRightAddon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Tooltip,
  Divider,
  Alert,
  AlertIcon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useDisclosure,
} from '@chakra-ui/react';
import {
  Vault,
  ArrowUp,
  ArrowDown,
  Info,
  Lock,
  Leaf,
  ChartLine,
  Shield,
  Coins,
  Lightning,
  CheckCircle,
} from '@phosphor-icons/react';
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatEther, parseEther } from 'viem';
import { useAccount } from 'wagmi';

import { useLiquidPARS, useSelfRepayingParams } from '../../hooks/useLiquidPARS';
import { useVotingPower, useVotingPowerSimulator } from '../../hooks/useVotingPower';
import { HALAL_STRATEGIES, LIQUID_PARS_VAULT } from '../../types/liquidProtocol';

function formatNumber(value: bigint | number, decimals = 2): string {
  const num = typeof value === 'bigint' ? Number(formatEther(value)) : value;
  return num.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function formatPercent(value: number, decimals = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

function VaultStatsCard() {
  const { vaultStats, isLoading } = useLiquidPARS();

  if (isLoading) {
    return (
      <Box bg="color-neutral-900" p={6} borderRadius="lg" border="1px solid" borderColor="color-neutral-800">
        <Text color="color-neutral-400">Loading vault stats...</Text>
      </Box>
    );
  }

  const stats = vaultStats ?? {
    totalAssets: 0n,
    totalShares: 0n,
    sharePrice: 1,
    expectedAPY: { min: 0.03, max: 0.08 },
    feeSplit: LIQUID_PARS_VAULT.feeSplit,
  };

  return (
    <Box bg="color-neutral-900" p={6} borderRadius="lg" border="1px solid" borderColor="color-neutral-800">
      <HStack spacing={2} mb={4}>
        <Icon as={Vault} color="color-gold-400" boxSize={5} />
        <Text textStyle="text-lg-medium" color="white">
          LiquidPARS Vault (xPARS)
        </Text>
        <Badge colorScheme="green">ERC4626</Badge>
      </HStack>

      <Grid templateColumns={['1fr', '1fr', 'repeat(2, 1fr)', 'repeat(4, 1fr)']} gap={4}>
        <Stat>
          <StatLabel color="color-neutral-400">Total Value Locked</StatLabel>
          <StatNumber color="white">{formatNumber(stats.totalAssets)} PARS</StatNumber>
          <StatHelpText color="color-neutral-500">
            {formatNumber(stats.totalShares)} xPARS shares
          </StatHelpText>
        </Stat>

        <Stat>
          <StatLabel color="color-neutral-400">Share Price</StatLabel>
          <StatNumber color="white">{stats.sharePrice.toFixed(4)}</StatNumber>
          <StatHelpText color="green.400">
            <StatArrow type="increase" />
            Auto-compounding
          </StatHelpText>
        </Stat>

        <Stat>
          <StatLabel color="color-neutral-400">Expected APY</StatLabel>
          <StatNumber color="color-gold-400">
            {formatPercent(stats.expectedAPY.min)} - {formatPercent(stats.expectedAPY.max)}
          </StatNumber>
          <StatHelpText color="color-neutral-500">Blended halal strategies</StatHelpText>
        </Stat>

        <Stat>
          <StatLabel color="color-neutral-400">Fee Split</StatLabel>
          <StatNumber color="white">{formatPercent(stats.feeSplit.toYieldVault)}</StatNumber>
          <StatHelpText color="color-neutral-500">to xPARS holders</StatHelpText>
        </Stat>
      </Grid>

      {/* Fee breakdown */}
      <Box mt={4}>
        <Text textStyle="text-xs-regular" color="color-neutral-400" mb={2}>
          Revenue Distribution
        </Text>
        <Flex h={2} borderRadius="full" overflow="hidden">
          <Tooltip label={`Yield: ${formatPercent(stats.feeSplit.toYieldVault)}`}>
            <Box h="full" w={`${stats.feeSplit.toYieldVault * 100}%`} bg="green.500" />
          </Tooltip>
          <Tooltip label={`Treasury: ${formatPercent(stats.feeSplit.toTreasury)}`}>
            <Box h="full" w={`${stats.feeSplit.toTreasury * 100}%`} bg="blue.500" />
          </Tooltip>
          <Tooltip label={`Slashing Reserve: ${formatPercent(stats.feeSplit.toSlashingReserve)}`}>
            <Box h="full" w={`${stats.feeSplit.toSlashingReserve * 100}%`} bg="purple.500" />
          </Tooltip>
        </Flex>
        <HStack spacing={4} mt={2}>
          <HStack spacing={1}>
            <Box w={2} h={2} borderRadius="full" bg="green.500" />
            <Text textStyle="text-xs-regular" color="color-neutral-400">
              Yield ({formatPercent(stats.feeSplit.toYieldVault)})
            </Text>
          </HStack>
          <HStack spacing={1}>
            <Box w={2} h={2} borderRadius="full" bg="blue.500" />
            <Text textStyle="text-xs-regular" color="color-neutral-400">
              Treasury ({formatPercent(stats.feeSplit.toTreasury)})
            </Text>
          </HStack>
          <HStack spacing={1}>
            <Box w={2} h={2} borderRadius="full" bg="purple.500" />
            <Text textStyle="text-xs-regular" color="color-neutral-400">
              Reserve ({formatPercent(stats.feeSplit.toSlashingReserve)})
            </Text>
          </HStack>
        </HStack>
      </Box>
    </Box>
  );
}

function UserPositionCard() {
  const { position, deposit, withdraw, isPending } = useLiquidPARS();
  const { isConnected } = useAccount();
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  if (!isConnected) {
    return (
      <Box bg="color-neutral-900" p={6} borderRadius="lg" border="1px solid" borderColor="color-neutral-800">
        <VStack spacing={4}>
          <Icon as={Vault} color="color-neutral-500" boxSize={10} />
          <Text color="color-neutral-400">Connect wallet to view your position</Text>
        </VStack>
      </Box>
    );
  }

  const pos = position ?? {
    shares: 0n,
    assetsValue: 0n,
    unrealizedYield: 0n,
    sharePrice: 1,
  };

  const handleDeposit = async () => {
    if (!depositAmount) return;
    try {
      await deposit(parseEther(depositAmount));
      setDepositAmount('');
    } catch (e) {
      console.error('Deposit failed:', e);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount) return;
    try {
      await withdraw(parseEther(withdrawAmount));
      setWithdrawAmount('');
    } catch (e) {
      console.error('Withdraw failed:', e);
    }
  };

  return (
    <Box bg="color-neutral-900" p={6} borderRadius="lg" border="1px solid" borderColor="color-neutral-800">
      <HStack spacing={2} mb={4}>
        <Icon as={Coins} color="color-gold-400" boxSize={5} />
        <Text textStyle="text-lg-medium" color="white">
          Your Position
        </Text>
      </HStack>

      <Grid templateColumns={['1fr', 'repeat(2, 1fr)']} gap={4} mb={6}>
        <Box>
          <Text textStyle="text-xs-regular" color="color-neutral-400">
            xPARS Balance
          </Text>
          <Text textStyle="text-xl-medium" color="white">
            {formatNumber(pos.shares)}
          </Text>
        </Box>
        <Box>
          <Text textStyle="text-xs-regular" color="color-neutral-400">
            Value (PARS)
          </Text>
          <Text textStyle="text-xl-medium" color="white">
            {formatNumber(pos.assetsValue)}
          </Text>
        </Box>
        <Box>
          <Text textStyle="text-xs-regular" color="color-neutral-400">
            Unrealized Yield
          </Text>
          <Text textStyle="text-xl-medium" color="green.400">
            +{formatNumber(pos.unrealizedYield)}
          </Text>
        </Box>
        <Box>
          <Text textStyle="text-xs-regular" color="color-neutral-400">
            Share Price
          </Text>
          <Text textStyle="text-xl-medium" color="white">
            {pos.sharePrice.toFixed(4)}
          </Text>
        </Box>
      </Grid>

      <Divider borderColor="color-neutral-700" mb={4} />

      <Tabs variant="soft-rounded" colorScheme="yellow" size="sm">
        <TabList mb={4}>
          <Tab>
            <HStack spacing={1}>
              <Icon as={ArrowDown} />
              <Text>Deposit</Text>
            </HStack>
          </Tab>
          <Tab>
            <HStack spacing={1}>
              <Icon as={ArrowUp} />
              <Text>Withdraw</Text>
            </HStack>
          </Tab>
        </TabList>

        <TabPanels>
          <TabPanel p={0}>
            <VStack spacing={3}>
              <InputGroup size="md">
                <Input
                  placeholder="Amount"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  type="number"
                  bg="color-neutral-800"
                  border="none"
                />
                <InputRightAddon bg="color-neutral-700" border="none">
                  PARS
                </InputRightAddon>
              </InputGroup>
              <Button
                w="full"
                colorScheme="yellow"
                leftIcon={<Icon as={ArrowDown} />}
                onClick={handleDeposit}
                isLoading={isPending}
                isDisabled={!depositAmount}
              >
                Deposit PARS
              </Button>
              <Text textStyle="text-xs-regular" color="color-neutral-500">
                Deposit PARS to receive yield-bearing xPARS shares
              </Text>
            </VStack>
          </TabPanel>

          <TabPanel p={0}>
            <VStack spacing={3}>
              <InputGroup size="md">
                <Input
                  placeholder="Amount"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  type="number"
                  bg="color-neutral-800"
                  border="none"
                />
                <InputRightAddon bg="color-neutral-700" border="none">
                  PARS
                </InputRightAddon>
              </InputGroup>
              <Button
                w="full"
                colorScheme="yellow"
                variant="outline"
                leftIcon={<Icon as={ArrowUp} />}
                onClick={handleWithdraw}
                isLoading={isPending}
                isDisabled={!withdrawAmount}
              >
                Withdraw PARS
              </Button>
              <Text textStyle="text-xs-regular" color="color-neutral-500">
                Withdraw PARS by burning xPARS shares
              </Text>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}

function VotingPowerCard() {
  const { breakdown, karmaInfo, params } = useVotingPower();
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <Box bg="color-neutral-900" p={6} borderRadius="lg" border="1px solid" borderColor="color-neutral-800">
        <VStack spacing={4}>
          <Icon as={Lightning} color="color-neutral-500" boxSize={10} />
          <Text color="color-neutral-400">Connect wallet to view voting power</Text>
        </VStack>
      </Box>
    );
  }

  const bp = breakdown ?? {
    parsBalance: 0n,
    karma: 100,
    lockMonths: 0,
    lockEnd: 0,
    karmaMultiplier: 1,
    lockMultiplier: 1,
    totalMultiplier: 1,
    votingPower: 0n,
    votingShare: 0,
  };

  return (
    <Box bg="color-neutral-900" p={6} borderRadius="lg" border="1px solid" borderColor="color-neutral-800">
      <HStack spacing={2} mb={4}>
        <Icon as={Lightning} color="color-gold-400" boxSize={5} />
        <Text textStyle="text-lg-medium" color="white">
          Voting Power (vPARS)
        </Text>
      </HStack>

      <Grid templateColumns={['1fr', 'repeat(2, 1fr)']} gap={4} mb={4}>
        <Box>
          <Text textStyle="text-xs-regular" color="color-neutral-400">
            PARS Balance
          </Text>
          <Text textStyle="text-xl-medium" color="white">
            {formatNumber(bp.parsBalance)}
          </Text>
        </Box>
        <Box>
          <Text textStyle="text-xs-regular" color="color-neutral-400">
            vPARS Power
          </Text>
          <Text textStyle="text-xl-medium" color="color-gold-400">
            {formatNumber(bp.votingPower)}
          </Text>
        </Box>
      </Grid>

      {/* Multiplier breakdown */}
      <Box bg="color-neutral-800" p={4} borderRadius="md" mb={4}>
        <Text textStyle="text-sm-medium" color="white" mb={3}>
          Boost Breakdown
        </Text>
        <Grid templateColumns="repeat(3, 1fr)" gap={3}>
          <Box textAlign="center">
            <Text textStyle="text-2xl-medium" color="green.400">
              {bp.karmaMultiplier.toFixed(2)}x
            </Text>
            <Text textStyle="text-xs-regular" color="color-neutral-400">
              Karma ({bp.karma})
            </Text>
          </Box>
          <Box textAlign="center">
            <Text textStyle="text-2xl-medium" color="blue.400">
              {bp.lockMultiplier.toFixed(2)}x
            </Text>
            <Text textStyle="text-xs-regular" color="color-neutral-400">
              Lock ({bp.lockMonths}mo)
            </Text>
          </Box>
          <Box textAlign="center">
            <Text textStyle="text-2xl-medium" color="color-gold-400">
              {bp.totalMultiplier.toFixed(2)}x
            </Text>
            <Text textStyle="text-xs-regular" color="color-neutral-400">
              Total
            </Text>
          </Box>
        </Grid>
        <Text textStyle="text-xs-regular" color="color-neutral-500" mt={2} textAlign="center">
          Max boost: {params.maxBoost}x (Karma 1000 × 40mo lock)
        </Text>
      </Box>

      {/* Karma info */}
      {karmaInfo && (
        <Box>
          <HStack justify="space-between" mb={2}>
            <Text textStyle="text-sm-medium" color="white">
              Karma Score
            </Text>
            <Badge colorScheme={karmaInfo.isActive ? 'green' : 'yellow'}>
              {karmaInfo.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </HStack>
          <Progress
            value={karmaInfo.current}
            max={1000}
            colorScheme="green"
            bg="color-neutral-800"
            borderRadius="full"
            size="sm"
          />
          <HStack justify="space-between" mt={1}>
            <Text textStyle="text-xs-regular" color="color-neutral-500">
              {karmaInfo.current} / 1000
            </Text>
            <Text textStyle="text-xs-regular" color="color-neutral-500">
              1yr projection: {karmaInfo.projectedOneYear.toFixed(0)}
            </Text>
          </HStack>
        </Box>
      )}
    </Box>
  );
}

function StrategiesCard() {
  return (
    <Box bg="color-neutral-900" p={6} borderRadius="lg" border="1px solid" borderColor="color-neutral-800">
      <HStack spacing={2} mb={4}>
        <Icon as={Leaf} color="green.400" boxSize={5} />
        <Text textStyle="text-lg-medium" color="white">
          Shariah-Compliant Strategies
        </Text>
        <Badge colorScheme="green">Halal</Badge>
      </HStack>

      <Alert status="info" bg="color-neutral-800" borderRadius="md" mb={4}>
        <AlertIcon />
        <Text textStyle="text-sm-regular">
          All strategies are screened for Shariah compliance: no riba (interest), no maysir (gambling), no haram industries.
        </Text>
      </Alert>

      <VStack spacing={3} align="stretch">
        {HALAL_STRATEGIES.map((strategy) => (
          <Box
            key={strategy.name}
            p={3}
            bg="color-neutral-800"
            borderRadius="md"
            border="1px solid"
            borderColor="color-neutral-700"
          >
            <HStack justify="space-between" mb={2}>
              <HStack spacing={2}>
                <Icon as={CheckCircle} color="green.400" />
                <Text textStyle="text-sm-medium" color="white">
                  {strategy.name}
                </Text>
              </HStack>
              <Badge
                colorScheme={
                  strategy.riskLevel === 'low'
                    ? 'green'
                    : strategy.riskLevel === 'medium'
                      ? 'yellow'
                      : 'red'
                }
              >
                {strategy.riskLevel} risk
              </Badge>
            </HStack>
            <HStack justify="space-between">
              <Text textStyle="text-xs-regular" color="color-neutral-400">
                {strategy.shariahNotes}
              </Text>
              <Text textStyle="text-sm-medium" color="color-gold-400">
                {formatPercent(strategy.expectedAPY.min)} - {formatPercent(strategy.expectedAPY.max)}
              </Text>
            </HStack>
          </Box>
        ))}
      </VStack>
    </Box>
  );
}

function SelfRepayingLoansCard() {
  const params = useSelfRepayingParams();

  return (
    <Box bg="color-neutral-900" p={6} borderRadius="lg" border="1px solid" borderColor="color-neutral-800">
      <HStack spacing={2} mb={4}>
        <Icon as={Shield} color="color-gold-400" boxSize={5} />
        <Text textStyle="text-lg-medium" color="white">
          Self-Repaying Loans
        </Text>
        <Badge colorScheme="purple">Coming Soon</Badge>
      </HStack>

      <Text textStyle="text-sm-regular" color="color-neutral-300" mb={4}>
        Borrow against your PARS without interest. Your debt decreases as protocol yield accrues - a Shariah-compliant
        alternative to interest-bearing loans.
      </Text>

      <Grid templateColumns={['1fr', 'repeat(2, 1fr)', 'repeat(3, 1fr)']} gap={4}>
        <Box bg="color-neutral-800" p={3} borderRadius="md">
          <Text textStyle="text-xs-regular" color="color-neutral-400">
            Max LTV
          </Text>
          <Text textStyle="text-lg-medium" color="white">
            {formatPercent(params.maxLTV)}
          </Text>
        </Box>
        <Box bg="color-neutral-800" p={3} borderRadius="md">
          <Text textStyle="text-xs-regular" color="color-neutral-400">
            Liquidation Threshold
          </Text>
          <Text textStyle="text-lg-medium" color="white">
            {formatPercent(params.liquidationThreshold)}
          </Text>
        </Box>
        <Box bg="color-neutral-800" p={3} borderRadius="md">
          <Text textStyle="text-xs-regular" color="color-neutral-400">
            Liquidation Bonus
          </Text>
          <Text textStyle="text-lg-medium" color="white">
            {formatPercent(params.liquidationBonus)}
          </Text>
        </Box>
        <Box bg="color-neutral-800" p={3} borderRadius="md">
          <Text textStyle="text-xs-regular" color="color-neutral-400">
            Backing Requirement
          </Text>
          <Text textStyle="text-lg-medium" color="white">
            {formatPercent(params.backingRequirement)}
          </Text>
        </Box>
        <Box bg="color-neutral-800" p={3} borderRadius="md">
          <Text textStyle="text-xs-regular" color="color-neutral-400">
            Peg Degrade
          </Text>
          <Text textStyle="text-lg-medium" color="white">
            {formatPercent(params.pegDegradeThreshold)}
          </Text>
        </Box>
        <Box bg="color-neutral-800" p={3} borderRadius="md">
          <Text textStyle="text-xs-regular" color="color-neutral-400">
            Peg Pause
          </Text>
          <Text textStyle="text-lg-medium" color="white">
            {formatPercent(params.pegPauseThreshold)}
          </Text>
        </Box>
      </Grid>

      <Alert status="success" bg="color-neutral-800" borderRadius="md" mt={4}>
        <AlertIcon color="green.400" />
        <Box>
          <Text textStyle="text-sm-medium" color="white">
            Shariah-Compliant Design
          </Text>
          <Text textStyle="text-xs-regular" color="color-neutral-400">
            Mudarabah-like profit sharing. No interest charged - debt repays from protocol yield.
          </Text>
        </Box>
      </Alert>
    </Box>
  );
}

export function LiquidPARSPage() {
  const { t } = useTranslation('common');

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <HStack spacing={3} mb={2}>
            <Icon as={Vault} color="color-gold-400" boxSize={8} />
            <Box>
              <HStack spacing={2}>
                <Text textStyle="text-2xl-medium" color="white">
                  LiquidPARS
                </Text>
                <Text textStyle="text-xl-regular" color="color-neutral-400" dir="rtl">
                  پارس مایع
                </Text>
              </HStack>
              <Text textStyle="text-sm-regular" color="color-neutral-400">
                Yield-bearing vault with Shariah-compliant strategies
              </Text>
            </Box>
          </HStack>
        </Box>

        {/* Main Stats */}
        <VaultStatsCard />

        {/* User Section */}
        <Grid templateColumns={['1fr', '1fr', 'repeat(2, 1fr)']} gap={6}>
          <UserPositionCard />
          <VotingPowerCard />
        </Grid>

        {/* Strategies */}
        <StrategiesCard />

        {/* Self-Repaying Loans */}
        <SelfRepayingLoansCard />
      </VStack>
    </Container>
  );
}
