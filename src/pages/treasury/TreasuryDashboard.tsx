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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Tooltip,
  Divider,
  Select,
} from '@chakra-ui/react';
import {
  Vault,
  ArrowUp,
  ArrowDown,
  Info,
  Clock,
  CheckCircle,
  XCircle,
  Hourglass,
  Receipt,
  ChartPie,
  Coins,
  Buildings,
  Lightning,
  Shield,
  Warning,
} from '@phosphor-icons/react';
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatEther } from 'viem';
import { Link } from 'react-router-dom';

import {
  FEE_ROUTER_CONFIG,
  GAUGE_CONTROLLER_CONFIG,
  DAO_VAULT_CONFIGS,
  TREASURY_VAULT_CONFIG,
  TREASURY_FEE_VAULT_CONFIG,
  POL_VAULT_CONFIG,
  TIMELOCK_CONFIG,
  VaultBalance,
  FeeFlowStats,
  SpendingProposal,
  ExecutionReceipt,
  GaugeWeight,
  calculateFeeDistribution,
  calculateGaugeAllocations,
} from '../../types/cashflow';
import { PARS_10_DAOS } from '../../types/daoHierarchy';

function formatNumber(value: bigint | number, decimals = 2): string {
  const num = typeof value === 'bigint' ? Number(formatEther(value)) : value;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function formatUSD(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

// Mock data for development (will be replaced with on-chain data)
const MOCK_VAULT_BALANCES: VaultBalance[] = [
  { vaultId: 'treasury-main', asset: 'USDC', balance: BigInt(5_000_000e18), usdValue: 5_000_000, lastUpdated: Date.now() },
  { vaultId: 'treasury-fees', asset: 'USDC', balance: BigInt(500_000e18), usdValue: 500_000, lastUpdated: Date.now() },
  { vaultId: 'pol', asset: 'LP', balance: BigInt(2_000_000e18), usdValue: 2_000_000, lastUpdated: Date.now() },
  ...PARS_10_DAOS.map((dao, i) => ({
    vaultId: `${dao.id}-vault`,
    asset: 'USDC',
    balance: BigInt((50_000 + i * 10_000) * 1e18),
    usdValue: 50_000 + i * 10_000,
    lastUpdated: Date.now(),
  })),
];

const MOCK_FEE_STATS: FeeFlowStats = {
  period: '7d',
  totalCollected: BigInt(100_000e18),
  baseSplitDistributed: BigInt(10_000e18),
  remainderAmount: BigInt(90_000e18),
  byDAO: Object.fromEntries(PARS_10_DAOS.map(dao => [dao.id, BigInt(1_000e18)])),
  byGauge: {
    'pol-growth': BigInt(27_000e18),
    'holder-rewards': BigInt(36_000e18),
    'program-budgets': BigInt(18_000e18),
    'reserves': BigInt(9_000e18),
  },
};

const MOCK_PROPOSALS: SpendingProposal[] = [
  {
    id: 'prop-001',
    status: 'queued',
    proposer: '0x1234...5678' as any,
    destination: '0xabcd...ef01' as any,
    amount: BigInt(50_000e18),
    asset: 'USDC',
    purpose: 'Health DAO quarterly operations budget',
    timelockEnd: Date.now() + 48 * 60 * 60 * 1000,
  },
  {
    id: 'prop-002',
    status: 'executed',
    proposer: '0x2345...6789' as any,
    destination: '0xbcde...f012' as any,
    amount: BigInt(25_000e18),
    asset: 'USDC',
    purpose: 'Research DAO grant disbursement',
    executedAt: Date.now() - 24 * 60 * 60 * 1000,
    attachmentHash: 'Qm...',
  },
  {
    id: 'prop-003',
    status: 'pending',
    proposer: '0x3456...7890' as any,
    destination: '0xcdef...0123' as any,
    amount: BigInt(100_000e18),
    asset: 'USDC',
    purpose: 'POL liquidity provision (Curve)',
  },
];

function VaultBalancesCard() {
  const treasuryBalance = MOCK_VAULT_BALANCES.find(v => v.vaultId === 'treasury-main');
  const feeVaultBalance = MOCK_VAULT_BALANCES.find(v => v.vaultId === 'treasury-fees');
  const polBalance = MOCK_VAULT_BALANCES.find(v => v.vaultId === 'pol');
  const daoBalances = MOCK_VAULT_BALANCES.filter(v => v.vaultId.endsWith('-vault') && v.vaultId !== 'treasury-main');

  const totalDAOBalance = daoBalances.reduce((sum, v) => sum + v.usdValue, 0);
  const totalBalance = (treasuryBalance?.usdValue || 0) + (feeVaultBalance?.usdValue || 0) +
    (polBalance?.usdValue || 0) + totalDAOBalance;

  return (
    <Box bg="color-neutral-900" p={6} borderRadius="lg" border="1px solid" borderColor="color-neutral-800">
      <HStack spacing={2} mb={4}>
        <Icon as={Vault} color="color-gold-400" boxSize={5} />
        <Text textStyle="text-lg-medium" color="white">
          Live Vault Balances
        </Text>
      </HStack>

      <Grid templateColumns={['1fr', 'repeat(2, 1fr)', 'repeat(4, 1fr)']} gap={4} mb={4}>
        <Stat>
          <StatLabel color="color-neutral-400">Treasury (T)</StatLabel>
          <StatNumber color="white">{formatUSD(treasuryBalance?.usdValue || 0)}</StatNumber>
          <StatHelpText color="color-neutral-500">Main treasury</StatHelpText>
        </Stat>
        <Stat>
          <StatLabel color="color-neutral-400">Fee Vault</StatLabel>
          <StatNumber color="white">{formatUSD(feeVaultBalance?.usdValue || 0)}</StatNumber>
          <StatHelpText color="color-neutral-500">90% of fees</StatHelpText>
        </Stat>
        <Stat>
          <StatLabel color="color-neutral-400">POL Vault</StatLabel>
          <StatNumber color="color-gold-400">{formatUSD(polBalance?.usdValue || 0)}</StatNumber>
          <StatHelpText color="color-neutral-500">Protocol liquidity</StatHelpText>
        </Stat>
        <Stat>
          <StatLabel color="color-neutral-400">DAO Vaults (10)</StatLabel>
          <StatNumber color="white">{formatUSD(totalDAOBalance)}</StatNumber>
          <StatHelpText color="color-neutral-500">1% each baseline</StatHelpText>
        </Stat>
      </Grid>

      <Box bg="color-neutral-800" p={3} borderRadius="md">
        <HStack justify="space-between">
          <Text textStyle="text-sm-medium" color="white">Total Protocol Value</Text>
          <Text textStyle="text-xl-medium" color="color-gold-400">{formatUSD(totalBalance)}</Text>
        </HStack>
      </Box>
    </Box>
  );
}

function FeeFlowsCard() {
  const [period, setPeriod] = useState<'24h' | '7d' | '30d'>('7d');
  const stats = MOCK_FEE_STATS;

  return (
    <Box bg="color-neutral-900" p={6} borderRadius="lg" border="1px solid" borderColor="color-neutral-800">
      <HStack justify="space-between" mb={4}>
        <HStack spacing={2}>
          <Icon as={Coins} color="color-gold-400" boxSize={5} />
          <Text textStyle="text-lg-medium" color="white">
            Fee Flows
          </Text>
        </HStack>
        <Select
          size="sm"
          w="100px"
          value={period}
          onChange={(e) => setPeriod(e.target.value as any)}
          bg="color-neutral-800"
          border="none"
        >
          <option value="24h">24h</option>
          <option value="7d">7d</option>
          <option value="30d">30d</option>
        </Select>
      </HStack>

      <Grid templateColumns={['1fr', 'repeat(3, 1fr)']} gap={4} mb={4}>
        <Box bg="color-neutral-800" p={3} borderRadius="md">
          <Text textStyle="text-xs-regular" color="color-neutral-400">Total Collected</Text>
          <Text textStyle="text-lg-medium" color="white">{formatNumber(stats.totalCollected)} USDC</Text>
        </Box>
        <Box bg="color-neutral-800" p={3} borderRadius="md">
          <Text textStyle="text-xs-regular" color="color-neutral-400">Base Split (10%)</Text>
          <Text textStyle="text-lg-medium" color="green.400">{formatNumber(stats.baseSplitDistributed)} USDC</Text>
        </Box>
        <Box bg="color-neutral-800" p={3} borderRadius="md">
          <Text textStyle="text-xs-regular" color="color-neutral-400">Remainder (90%)</Text>
          <Text textStyle="text-lg-medium" color="blue.400">{formatNumber(stats.remainderAmount)} USDC</Text>
        </Box>
      </Grid>

      {/* Base split visualization */}
      <Box mb={4}>
        <Text textStyle="text-sm-medium" color="white" mb={2}>Base Split Distribution (1% each)</Text>
        <Flex h={2} borderRadius="full" overflow="hidden" bg="color-neutral-800">
          {PARS_10_DAOS.map((dao, i) => (
            <Tooltip key={dao.id} label={`${dao.name}: 1%`}>
              <Box h="full" w="10%" bg={`hsl(${i * 36}, 60%, 50%)`} />
            </Tooltip>
          ))}
        </Flex>
      </Box>

      {/* Gauge allocation */}
      <Box>
        <Text textStyle="text-sm-medium" color="white" mb={2}>Remainder Allocation (90%)</Text>
        <VStack spacing={2} align="stretch">
          {GAUGE_CONTROLLER_CONFIG.weights.map((gauge) => (
            <HStack key={gauge.category} justify="space-between">
              <HStack spacing={2}>
                <Box w={3} h={3} borderRadius="full" bg={
                  gauge.category === 'pol-growth' ? 'green.500' :
                  gauge.category === 'holder-rewards' ? 'blue.500' :
                  gauge.category === 'program-budgets' ? 'purple.500' : 'orange.500'
                } />
                <Text textStyle="text-sm-regular" color="color-neutral-300">{gauge.label}</Text>
              </HStack>
              <HStack spacing={3}>
                <Text textStyle="text-sm-medium" color="white">{gauge.weight}%</Text>
                <Text textStyle="text-xs-regular" color="color-neutral-500">
                  ~{formatNumber(stats.byGauge[gauge.category])} USDC
                </Text>
              </HStack>
            </HStack>
          ))}
        </VStack>
      </Box>
    </Box>
  );
}

function GaugeWeightsCard() {
  const config = GAUGE_CONTROLLER_CONFIG;

  return (
    <Box bg="color-neutral-900" p={6} borderRadius="lg" border="1px solid" borderColor="color-neutral-800">
      <HStack justify="space-between" mb={4}>
        <HStack spacing={2}>
          <Icon as={ChartPie} color="color-gold-400" boxSize={5} />
          <Text textStyle="text-lg-medium" color="white">
            Gauge Allocations
          </Text>
        </HStack>
        <Badge colorScheme="yellow">Epoch {config.currentEpoch}</Badge>
      </HStack>

      <Text textStyle="text-sm-regular" color="color-neutral-400" mb={4}>
        Where the 90% remainder is currently targeted. Changeable via governance.
      </Text>

      <VStack spacing={3} align="stretch">
        {config.weights.map((gauge) => (
          <Box key={gauge.category}>
            <HStack justify="space-between" mb={1}>
              <Text textStyle="text-sm-medium" color="white">{gauge.label}</Text>
              <Text textStyle="text-sm-medium" color="color-gold-400">{gauge.weight}%</Text>
            </HStack>
            <Progress
              value={gauge.weight}
              max={100}
              colorScheme={
                gauge.category === 'pol-growth' ? 'green' :
                gauge.category === 'holder-rewards' ? 'blue' :
                gauge.category === 'program-budgets' ? 'purple' : 'orange'
              }
              bg="color-neutral-800"
              borderRadius="full"
              size="sm"
            />
            <Text textStyle="text-xs-regular" color="color-neutral-500" mt={1}>
              {gauge.description}
            </Text>
          </Box>
        ))}
      </VStack>

      <Divider borderColor="color-neutral-700" my={4} />

      <HStack justify="space-between">
        <VStack align="start" spacing={0}>
          <Text textStyle="text-xs-regular" color="color-neutral-400">Epoch Duration</Text>
          <Text textStyle="text-sm-medium" color="white">{config.epochDurationWeeks} week</Text>
        </VStack>
        <VStack align="end" spacing={0}>
          <Text textStyle="text-xs-regular" color="color-neutral-400">Max Change/Epoch</Text>
          <Text textStyle="text-sm-medium" color="white">±{config.maxWeightChangePerEpoch}%</Text>
        </VStack>
      </HStack>
    </Box>
  );
}

function SpendingProposalsCard() {
  const proposals = MOCK_PROPOSALS;

  const statusIcon = (status: string) => {
    switch (status) {
      case 'executed': return <Icon as={CheckCircle} color="green.400" />;
      case 'queued': return <Icon as={Hourglass} color="yellow.400" />;
      case 'pending': return <Icon as={Clock} color="blue.400" />;
      case 'rejected': return <Icon as={XCircle} color="red.400" />;
      default: return <Icon as={Clock} color="gray.400" />;
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'executed': return 'green';
      case 'queued': return 'yellow';
      case 'pending': return 'blue';
      case 'rejected': return 'red';
      default: return 'gray';
    }
  };

  return (
    <Box bg="color-neutral-900" p={6} borderRadius="lg" border="1px solid" borderColor="color-neutral-800">
      <HStack justify="space-between" mb={4}>
        <HStack spacing={2}>
          <Icon as={Receipt} color="color-gold-400" boxSize={5} />
          <Text textStyle="text-lg-medium" color="white">
            Spending Proposals
          </Text>
        </HStack>
        <Button size="sm" colorScheme="yellow" variant="outline">
          View All
        </Button>
      </HStack>

      <VStack spacing={3} align="stretch">
        {proposals.map((proposal) => (
          <Box
            key={proposal.id}
            p={4}
            bg="color-neutral-800"
            borderRadius="md"
            border="1px solid"
            borderColor="color-neutral-700"
          >
            <HStack justify="space-between" mb={2}>
              <HStack spacing={2}>
                {statusIcon(proposal.status)}
                <Text textStyle="text-sm-medium" color="white">{proposal.id}</Text>
                <Badge colorScheme={statusColor(proposal.status)}>{proposal.status}</Badge>
              </HStack>
              <Text textStyle="text-sm-medium" color="color-gold-400">
                {formatNumber(proposal.amount)} {proposal.asset}
              </Text>
            </HStack>
            <Text textStyle="text-sm-regular" color="color-neutral-300" mb={2}>
              {proposal.purpose}
            </Text>
            <HStack justify="space-between">
              <Text textStyle="text-xs-regular" color="color-neutral-500">
                To: {String(proposal.destination).slice(0, 10)}...
              </Text>
              {proposal.timelockEnd && (
                <HStack spacing={1}>
                  <Icon as={Clock} boxSize={3} color="yellow.400" />
                  <Text textStyle="text-xs-regular" color="yellow.400">
                    Timelock: {Math.ceil((proposal.timelockEnd - Date.now()) / (60 * 60 * 1000))}h
                  </Text>
                </HStack>
              )}
              {proposal.executedAt && (
                <Text textStyle="text-xs-regular" color="green.400">
                  Executed {new Date(proposal.executedAt).toLocaleDateString()}
                </Text>
              )}
            </HStack>
          </Box>
        ))}
      </VStack>
    </Box>
  );
}

function DAOVaultsGrid() {
  return (
    <Box bg="color-neutral-900" p={6} borderRadius="lg" border="1px solid" borderColor="color-neutral-800">
      <HStack spacing={2} mb={4}>
        <Icon as={Buildings} color="color-gold-400" boxSize={5} />
        <Text textStyle="text-lg-medium" color="white">
          DAO Vaults (1% Base Funding Each)
        </Text>
      </HStack>

      <Grid templateColumns={['1fr', 'repeat(2, 1fr)', 'repeat(3, 1fr)', 'repeat(5, 1fr)']} gap={3}>
        {PARS_10_DAOS.map((dao) => {
          const balance = MOCK_VAULT_BALANCES.find(v => v.vaultId === `${dao.id}-vault`);
          return (
            <Link key={dao.id} to={`/dao-network/${dao.id}`}>
              <Box
                p={3}
                bg="color-neutral-800"
                borderRadius="md"
                cursor="pointer"
                _hover={{ bg: 'color-neutral-700' }}
                transition="all 200ms"
              >
                <HStack justify="space-between" mb={1}>
                  <Text textStyle="text-xs-medium" color="white" noOfLines={1}>
                    {dao.name}
                  </Text>
                  <Badge colorScheme="green" fontSize="10px">1%</Badge>
                </HStack>
                <Text textStyle="text-xs-regular" color="color-neutral-400" dir="rtl" mb={2}>
                  {dao.persianName}
                </Text>
                <Text textStyle="text-md-medium" color="color-gold-400">
                  {formatUSD(balance?.usdValue || 0)}
                </Text>
              </Box>
            </Link>
          );
        })}
      </Grid>
    </Box>
  );
}

function PolicySummaryCard() {
  return (
    <Box bg="color-neutral-900" p={6} borderRadius="lg" border="1px solid" borderColor="color-neutral-800">
      <HStack spacing={2} mb={4}>
        <Icon as={Info} color="color-gold-400" boxSize={5} />
        <Text textStyle="text-lg-medium" color="white">
          v1 Cashflow Policy
        </Text>
      </HStack>

      <VStack spacing={2} align="stretch">
        <HStack spacing={2}>
          <Icon as={CheckCircle} color="green.400" boxSize={4} />
          <Text textStyle="text-sm-regular" color="color-neutral-300">
            Mint proceeds → Treasury DAO (T)
          </Text>
        </HStack>
        <HStack spacing={2}>
          <Icon as={CheckCircle} color="green.400" boxSize={4} />
          <Text textStyle="text-sm-regular" color="color-neutral-300">
            Protocol fees → FeeRouter
          </Text>
        </HStack>
        <HStack spacing={2}>
          <Icon as={CheckCircle} color="green.400" boxSize={4} />
          <Text textStyle="text-sm-regular" color="color-neutral-300">
            1% of fees to each DAO vault (10% total base)
          </Text>
        </HStack>
        <HStack spacing={2}>
          <Icon as={CheckCircle} color="green.400" boxSize={4} />
          <Text textStyle="text-sm-regular" color="color-neutral-300">
            90% remainder → Treasury Fee Vault → gauge-controlled
          </Text>
        </HStack>
        <HStack spacing={2}>
          <Icon as={CheckCircle} color="green.400" boxSize={4} />
          <Text textStyle="text-sm-regular" color="color-neutral-300">
            All spending timelocked, allowlisted, receipt-backed
          </Text>
        </HStack>
      </VStack>

      <Divider borderColor="color-neutral-700" my={4} />

      <Grid templateColumns="repeat(3, 1fr)" gap={3}>
        <Box>
          <Text textStyle="text-xs-regular" color="color-neutral-400">Standard Timelock</Text>
          <Text textStyle="text-sm-medium" color="white">{TIMELOCK_CONFIG.standardSpend.min}-{TIMELOCK_CONFIG.standardSpend.max}h</Text>
        </Box>
        <Box>
          <Text textStyle="text-xs-regular" color="color-neutral-400">POL Timelock</Text>
          <Text textStyle="text-sm-medium" color="white">{TIMELOCK_CONFIG.polStrategy.min}-{TIMELOCK_CONFIG.polStrategy.max}h</Text>
        </Box>
        <Box>
          <Text textStyle="text-xs-regular" color="color-neutral-400">Emergency Expiry</Text>
          <Text textStyle="text-sm-medium" color="white">{TIMELOCK_CONFIG.emergencyExpiry}h</Text>
        </Box>
      </Grid>
    </Box>
  );
}

export function TreasuryDashboard() {
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
                  Treasury Dashboard
                </Text>
                <Text textStyle="text-xl-regular" color="color-neutral-400" dir="rtl">
                  داشبورد خزانه
                </Text>
              </HStack>
              <Text textStyle="text-sm-regular" color="color-neutral-400">
                Protocol cashflow, vault balances, and spending proposals
              </Text>
            </Box>
          </HStack>
        </Box>

        {/* Vault Balances */}
        <VaultBalancesCard />

        {/* Fee Flows + Gauges */}
        <Grid templateColumns={['1fr', '1fr', '1fr 1fr']} gap={6}>
          <FeeFlowsCard />
          <GaugeWeightsCard />
        </Grid>

        {/* DAO Vaults */}
        <DAOVaultsGrid />

        {/* Proposals + Policy */}
        <Grid templateColumns={['1fr', '1fr', '2fr 1fr']} gap={6}>
          <SpendingProposalsCard />
          <PolicySummaryCard />
        </Grid>
      </VStack>
    </Container>
  );
}
