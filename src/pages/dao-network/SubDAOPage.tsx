import {
  Box,
  Flex,
  Grid,
  Icon,
  Text,
  Badge,
  Progress,
  HStack,
  VStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Alert,
  AlertIcon,
  AlertDescription,
} from '@chakra-ui/react';
import {
  Shield,
  Vault,
  Scales,
  Heart,
  Scroll,
  GraduationCap,
  Buildings,
  Handshake,
  Rocket,
  ChartLine,
  FileText,
  Users,
  Clock,
  ArrowLeft,
  Plus,
  Download,
} from '@phosphor-icons/react';
import { useParams, Link } from 'react-router-dom';
import { formatEther } from 'viem';
import { getDAOById, CATEGORY_INFO, ENDOWMENT_RULES } from '../../types/daoHierarchy';
import { FEE_ROUTER_CONFIG } from '../../types/cashflow';

// Map icon names to actual icon components
const iconMap: Record<string, React.ElementType> = {
  Shield,
  Vault,
  Scales,
  Heart,
  Scroll,
  GraduationCap,
  Buildings,
  Handshake,
  Rocket,
  ChartLine,
};

const governanceLabels: Record<string, string> = {
  multisig: 'Multisig',
  'token-voting': 'Token Voting',
  hybrid: 'Hybrid',
  guardian: 'Guardian Council',
};

const statusColors: Record<string, string> = {
  active: 'green',
  bootstrap: 'yellow',
  'coming-soon': 'purple',
};

// Mock vault balance (will come from on-chain)
function getMockVaultBalance(daoId: string): { balance: bigint; usdValue: number; last7dFees: bigint } {
  const baseBalance = 50_000 + (daoId.charCodeAt(0) % 10) * 10_000;
  const last7dFees = 1_000 + (daoId.charCodeAt(0) % 5) * 200;
  return {
    balance: BigInt(baseBalance * 1e18),
    usdValue: baseBalance,
    last7dFees: BigInt(last7dFees * 1e18),
  };
}

function formatUSD(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

function VaultInfoCard({ dao }: { dao: NonNullable<ReturnType<typeof getDAOById>> }) {
  const vaultData = getMockVaultBalance(dao.id);

  return (
    <Box
      p={5}
      bg="color-neutral-900"
      borderRadius="lg"
      border="1px solid"
      borderColor="color-gold-400"
      mb={6}
    >
      <Grid templateColumns={['1fr', 'repeat(2, 1fr)', 'repeat(4, 1fr)']} gap={4}>
        {/* Vault Balance */}
        <Box>
          <HStack spacing={2} mb={2}>
            <Icon as={Vault} color="color-gold-400" boxSize={4} />
            <Text textStyle="text-xs-regular" color="color-neutral-400">
              Vault Balance
            </Text>
          </HStack>
          <Text textStyle="text-xl-medium" color="white">
            {formatUSD(vaultData.usdValue)}
          </Text>
          <Text textStyle="text-xs-regular" color="color-neutral-500">
            USDC
          </Text>
        </Box>

        {/* Fee Stream */}
        <Box>
          <HStack spacing={2} mb={2}>
            <Icon as={ChartLine} color="green.400" boxSize={4} />
            <Text textStyle="text-xs-regular" color="color-neutral-400">
              Fee Stream (7d)
            </Text>
          </HStack>
          <Text textStyle="text-xl-medium" color="green.400">
            +{formatUSD(Number(formatEther(vaultData.last7dFees)))}
          </Text>
          <Text textStyle="text-xs-regular" color="color-neutral-500">
            1% baseline allocation
          </Text>
        </Box>

        {/* Base Split */}
        <Box>
          <HStack spacing={2} mb={2}>
            <Icon as={Scales} color="blue.400" boxSize={4} />
            <Text textStyle="text-xs-regular" color="color-neutral-400">
              Base Split
            </Text>
          </HStack>
          <Text textStyle="text-xl-medium" color="white">
            {FEE_ROUTER_CONFIG.baseSplitPerDAO}%
          </Text>
          <Text textStyle="text-xs-regular" color="color-neutral-500">
            of all protocol fees
          </Text>
        </Box>

        {/* Timelock */}
        <Box>
          <HStack spacing={2} mb={2}>
            <Icon as={Clock} color="yellow.400" boxSize={4} />
            <Text textStyle="text-xs-regular" color="color-neutral-400">
              Spend Timelock
            </Text>
          </HStack>
          <Text textStyle="text-xl-medium" color="white">
            24-72h
          </Text>
          <Text textStyle="text-xs-regular" color="color-neutral-500">
            via Treasury execution
          </Text>
        </Box>
      </Grid>

      <Divider borderColor="color-neutral-700" my={4} />

      <HStack justify="space-between" flexWrap="wrap" gap={2}>
        <Text textStyle="text-xs-regular" color="color-neutral-400">
          Vault receives automatic 1% of all protocol fees (non-discretionary). Spending requires timelocked proposals through Treasury DAO.
        </Text>
        <Link to="/treasury-dashboard">
          <Button size="xs" variant="outline" borderColor="color-gold-400" color="color-gold-400">
            View Treasury Dashboard
          </Button>
        </Link>
      </HStack>
    </Box>
  );
}

function MandateTab({ dao }: { dao: NonNullable<ReturnType<typeof getDAOById>> }) {
  return (
    <VStack align="stretch" spacing={6}>
      {/* Mandate */}
      <Box>
        <Text textStyle="text-lg-medium" color="white" mb={2}>
          Mandate
        </Text>
        <Text textStyle="text-md-regular" color="color-neutral-300">
          {dao.mandate}
        </Text>
      </Box>

      {/* Ownership */}
      <Box>
        <Text textStyle="text-lg-medium" color="white" mb={3}>
          Owns
        </Text>
        <Grid templateColumns={['1fr', '1fr', 'repeat(2, 1fr)']} gap={4}>
          {dao.owns.map((item, index) => (
            <Box
              key={index}
              p={4}
              bg="color-neutral-900"
              borderRadius="lg"
              border="1px solid"
              borderColor="color-neutral-800"
            >
              <Text textStyle="text-sm-medium" color="white" mb={1}>
                {item.name}
              </Text>
              <Text textStyle="text-xs-regular" color="color-neutral-400">
                {item.description}
              </Text>
            </Box>
          ))}
        </Grid>
      </Box>

      {/* Outputs */}
      <Box>
        <Text textStyle="text-lg-medium" color="white" mb={3}>
          Outputs
        </Text>
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th color="color-neutral-400">Output</Th>
              <Th color="color-neutral-400">Frequency</Th>
              <Th color="color-neutral-400">Description</Th>
            </Tr>
          </Thead>
          <Tbody>
            {dao.outputs.map((output, index) => (
              <Tr key={index}>
                <Td color="white">{output.name}</Td>
                <Td>
                  <Badge colorScheme="gray" textTransform="capitalize">
                    {output.frequency}
                  </Badge>
                </Td>
                <Td color="color-neutral-400">{output.description}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Bootstrap Initiatives */}
      {dao.status === 'bootstrap' && (
        <Box>
          <Text textStyle="text-lg-medium" color="white" mb={3}>
            Bootstrap Initiatives (First 90 Days)
          </Text>
          <VStack align="stretch" spacing={2}>
            {dao.bootstrapInitiatives.map((initiative, index) => (
              <HStack key={index} p={3} bg="color-neutral-900" borderRadius="lg">
                <Badge colorScheme="yellow">{index + 1}</Badge>
                <Text textStyle="text-sm-regular" color="color-neutral-300">
                  {initiative}
                </Text>
              </HStack>
            ))}
          </VStack>
        </Box>
      )}
    </VStack>
  );
}

function BudgetTab({ dao }: { dao: NonNullable<ReturnType<typeof getDAOById>> }) {
  const categoryInfo = CATEGORY_INFO[dao.category];

  return (
    <VStack align="stretch" spacing={6}>
      {/* WT Allocation */}
      <Box
        p={6}
        bg="color-neutral-900"
        borderRadius="lg"
        border="1px solid"
        borderColor="color-neutral-800"
      >
        <HStack justify="space-between" mb={4}>
          <Text textStyle="text-lg-medium" color="white">
            Working Treasury Allocation
          </Text>
          <Text textStyle="text-2xl-medium" color="color-gold-400">
            {dao.workingTreasuryPercent}%
          </Text>
        </HStack>
        <Progress
          value={dao.workingTreasuryPercent}
          max={100}
          size="lg"
          colorScheme="yellow"
          bg="color-neutral-800"
          borderRadius="full"
        />
        <Text textStyle="text-xs-regular" color="color-neutral-400" mt={2}>
          Percentage of the 24-month Working Treasury budget allocated to this DAO.
        </Text>
      </Box>

      {/* Endowment Role */}
      {dao.hasEndowmentRole && (
        <Box
          p={6}
          bg="purple.900"
          borderRadius="lg"
          border="1px solid"
          borderColor="purple.700"
        >
          <HStack mb={4}>
            <Icon as={Vault} color="purple.300" boxSize={6} />
            <Text textStyle="text-lg-medium" color="white">
              Endowment Steward
            </Text>
          </HStack>
          <Text textStyle="text-sm-regular" color="purple.200" mb={4}>
            This DAO has stewardship responsibilities over the Endowment (END) fund.
          </Text>
          <Grid templateColumns={['1fr', 'repeat(2, 1fr)']} gap={4}>
            <Box>
              <Text textStyle="text-xs-regular" color="purple.300">Max Quarterly Deploy</Text>
              <Text textStyle="text-md-medium" color="white">{ENDOWMENT_RULES.maxQuarterlyDeployment * 100}%</Text>
            </Box>
            <Box>
              <Text textStyle="text-xs-regular" color="purple.300">Large Deploy Threshold</Text>
              <Text textStyle="text-md-medium" color="white">{ENDOWMENT_RULES.largeDeploymentThreshold * 100}%</Text>
            </Box>
          </Grid>
        </Box>
      )}

      {/* Budget vs Actual placeholder */}
      <Alert status="info" borderRadius="lg">
        <AlertIcon />
        <AlertDescription>
          Budget vs Actual data will be loaded from on-chain once Treasury DAO publishes disclosures.
        </AlertDescription>
      </Alert>
    </VStack>
  );
}

function ProposalsTab({ dao }: { dao: NonNullable<ReturnType<typeof getDAOById>> }) {
  return (
    <VStack align="stretch" spacing={6}>
      <HStack justify="space-between">
        <Text textStyle="text-lg-medium" color="white">
          Active Proposals
        </Text>
        <Button
          size="sm"
          leftIcon={<Icon as={Plus} />}
          bg="color-gold-400"
          color="color-neutral-950"
          _hover={{ bg: 'color-gold-300' }}
        >
          New Proposal
        </Button>
      </HStack>

      <Alert status="info" borderRadius="lg">
        <AlertIcon />
        <AlertDescription>
          Proposals will be loaded from the {dao.name} governance contract once deployed.
        </AlertDescription>
      </Alert>

      {/* Governance Info */}
      <Box
        p={4}
        bg="color-neutral-900"
        borderRadius="lg"
        border="1px solid"
        borderColor="color-neutral-800"
      >
        <Text textStyle="text-sm-medium" color="white" mb={2}>
          Governance Type
        </Text>
        <Badge colorScheme="purple" fontSize="sm">
          {governanceLabels[dao.governanceType]}
        </Badge>
        <Text textStyle="text-xs-regular" color="color-neutral-400" mt={2}>
          {dao.governanceType === 'multisig' && 'Proposals require threshold signatures from designated signers.'}
          {dao.governanceType === 'token-voting' && 'Proposals are voted on by PARS token holders.'}
          {dao.governanceType === 'hybrid' && 'Combines multisig execution with token holder oversight.'}
          {dao.governanceType === 'guardian' && 'Supreme Council acts as guardian with veto power.'}
        </Text>
      </Box>
    </VStack>
  );
}

function ExecutionTab({ dao }: { dao: NonNullable<ReturnType<typeof getDAOById>> }) {
  return (
    <VStack align="stretch" spacing={6}>
      <Text textStyle="text-lg-medium" color="white">
        Execution Capabilities
      </Text>

      <Alert status="info" borderRadius="lg">
        <AlertIcon />
        <AlertDescription>
          Contract allowlists and execution router configuration will be managed by Treasury DAO.
        </AlertDescription>
      </Alert>

      {/* Timelock Info */}
      <Box
        p={4}
        bg="color-neutral-900"
        borderRadius="lg"
        border="1px solid"
        borderColor="color-neutral-800"
      >
        <Text textStyle="text-sm-medium" color="white" mb={3}>
          Timelock Delays
        </Text>
        <Grid templateColumns="repeat(4, 1fr)" gap={4}>
          <Box>
            <Text textStyle="text-xs-regular" color="color-neutral-400">Small</Text>
            <Text textStyle="text-md-medium" color="white">{ENDOWMENT_RULES.timelockDays.small} days</Text>
          </Box>
          <Box>
            <Text textStyle="text-xs-regular" color="color-neutral-400">Medium</Text>
            <Text textStyle="text-md-medium" color="white">{ENDOWMENT_RULES.timelockDays.medium} days</Text>
          </Box>
          <Box>
            <Text textStyle="text-xs-regular" color="color-neutral-400">Large</Text>
            <Text textStyle="text-md-medium" color="white">{ENDOWMENT_RULES.timelockDays.large} days</Text>
          </Box>
          <Box>
            <Text textStyle="text-xs-regular" color="color-neutral-400">Critical</Text>
            <Text textStyle="text-md-medium" color="white">{ENDOWMENT_RULES.timelockDays.critical} days</Text>
          </Box>
        </Grid>
      </Box>
    </VStack>
  );
}

function ReportsTab({ dao }: { dao: NonNullable<ReturnType<typeof getDAOById>> }) {
  return (
    <VStack align="stretch" spacing={6}>
      <HStack justify="space-between">
        <Text textStyle="text-lg-medium" color="white">
          Reports & Disclosures
        </Text>
        <Button
          size="sm"
          leftIcon={<Icon as={Download} />}
          variant="outline"
          borderColor="color-neutral-600"
          color="color-neutral-300"
        >
          Export All
        </Button>
      </HStack>

      <Alert status="info" borderRadius="lg">
        <AlertIcon />
        <AlertDescription>
          Monthly disclosures and receipts will appear here once published by the DAO.
        </AlertDescription>
      </Alert>

      {/* Expected Reports */}
      <Box>
        <Text textStyle="text-sm-medium" color="white" mb={3}>
          Expected Reports
        </Text>
        <VStack align="stretch" spacing={2}>
          {dao.outputs.map((output, index) => (
            <HStack
              key={index}
              p={3}
              bg="color-neutral-900"
              borderRadius="lg"
              justify="space-between"
            >
              <HStack>
                <Icon as={FileText} color="color-neutral-400" />
                <Text textStyle="text-sm-regular" color="white">{output.name}</Text>
              </HStack>
              <Badge colorScheme="gray" textTransform="capitalize">
                {output.frequency}
              </Badge>
            </HStack>
          ))}
        </VStack>
      </Box>
    </VStack>
  );
}

function PartnersTab({ dao }: { dao: NonNullable<ReturnType<typeof getDAOById>> }) {
  const showPartners = dao.category === 'consular' || dao.category === 'health';

  if (!showPartners) {
    return (
      <Alert status="info" borderRadius="lg">
        <AlertIcon />
        <AlertDescription>
          Partner management is primarily handled by Consular DAO and Health DAO.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <VStack align="stretch" spacing={6}>
      <HStack justify="space-between">
        <Text textStyle="text-lg-medium" color="white">
          Partners & Operators
        </Text>
        <Button
          size="sm"
          leftIcon={<Icon as={Plus} />}
          bg="color-gold-400"
          color="color-neutral-950"
          _hover={{ bg: 'color-gold-300' }}
        >
          Add Partner
        </Button>
      </HStack>

      <Alert status="info" borderRadius="lg">
        <AlertIcon />
        <AlertDescription>
          Partner registry with privacy controls. Public totals, private details for verified operators.
        </AlertDescription>
      </Alert>

      {/* Privacy Notice */}
      <Box
        p={4}
        bg="color-neutral-900"
        borderRadius="lg"
        border="1px solid"
        borderColor="color-neutral-800"
      >
        <HStack mb={2}>
          <Icon as={Shield} color="color-gold-400" />
          <Text textStyle="text-sm-medium" color="white">Privacy Controls</Text>
        </HStack>
        <Text textStyle="text-xs-regular" color="color-neutral-400">
          Partner identities and beneficiary data are protected. Only aggregate metrics and verified delivery proofs are public.
        </Text>
      </Box>
    </VStack>
  );
}

export function SubDAOPage() {
  const { daoId } = useParams<{ daoId: string }>();
  const dao = getDAOById(daoId || '');

  if (!dao) {
    return (
      <Flex direction="column" align="center" justify="center" p={12}>
        <Text textStyle="text-xl-medium" color="white" mb={4}>
          DAO Not Found
        </Text>
        <Button as={Link} to="/" variant="outline">
          Back to Home
        </Button>
      </Flex>
    );
  }

  const categoryInfo = CATEGORY_INFO[dao.category];
  const IconComponent = iconMap[dao.icon] || Buildings;

  return (
    <Flex direction="column" mt="2.5rem">
      {/* Back Link */}
      <Link to="/">
        <HStack color="color-neutral-400" mb={4} _hover={{ color: 'white' }}>
          <Icon as={ArrowLeft} />
          <Text textStyle="text-sm-regular">Back to DAO Network</Text>
        </HStack>
      </Link>

      {/* Header */}
      <Flex
        direction={['column', 'row']}
        justify="space-between"
        align={['start', 'center']}
        gap={4}
        mb={6}
      >
        <HStack spacing={4}>
          <Flex
            align="center"
            justify="center"
            w={16}
            h={16}
            borderRadius="xl"
            bg={`${categoryInfo.color}.500`}
            color="white"
          >
            <Icon as={IconComponent} boxSize={8} />
          </Flex>
          <Box>
            <HStack spacing={2} mb={1}>
              <Text textStyle="text-3xl-medium" color="white">
                {dao.name}
              </Text>
              <Text textStyle="text-2xl-regular" color="color-neutral-400" dir="rtl">
                {dao.persianName}
              </Text>
            </HStack>
            <HStack spacing={2}>
              <Badge colorScheme={categoryInfo.color}>{categoryInfo.label}</Badge>
              <Badge colorScheme={statusColors[dao.status]}>{dao.status}</Badge>
              <Badge variant="outline" colorScheme="gray">
                {governanceLabels[dao.governanceType]}
              </Badge>
              {dao.hasEndowmentRole && (
                <Badge colorScheme="purple">END Steward</Badge>
              )}
            </HStack>
          </Box>
        </HStack>

        <Box textAlign={['left', 'right']}>
          <Text textStyle="text-3xl-medium" color="color-gold-400">
            {dao.workingTreasuryPercent}%
          </Text>
          <Text textStyle="text-sm-regular" color="color-neutral-400">
            Working Treasury
          </Text>
        </Box>
      </Flex>

      {/* Vault Info */}
      <VaultInfoCard dao={dao} />

      {/* Tabs */}
      <Tabs colorScheme="yellow" variant="enclosed">
        <TabList borderColor="color-neutral-800">
          <Tab>Mandate</Tab>
          <Tab>Budget</Tab>
          <Tab>Proposals</Tab>
          <Tab>Execution</Tab>
          <Tab>Reports</Tab>
          <Tab>Partners</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <MandateTab dao={dao} />
          </TabPanel>
          <TabPanel>
            <BudgetTab dao={dao} />
          </TabPanel>
          <TabPanel>
            <ProposalsTab dao={dao} />
          </TabPanel>
          <TabPanel>
            <ExecutionTab dao={dao} />
          </TabPanel>
          <TabPanel>
            <ReportsTab dao={dao} />
          </TabPanel>
          <TabPanel>
            <PartnersTab dao={dao} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Flex>
  );
}
