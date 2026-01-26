import {
  Box,
  Grid,
  HStack,
  VStack,
  Text,
  Icon,
  Badge,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Alert,
  AlertIcon,
  Tooltip,
  Divider,
} from '@chakra-ui/react';
import {
  Vault,
  Shield,
  Lock,
  Eye,
  EyeSlash,
  CheckCircle,
  Clock,
  Warning,
} from '@phosphor-icons/react';
import { formatEther } from 'viem';
import { PARS_10_DAOS } from '../../types/daoHierarchy';
import {
  ShieldedVault,
  GovernanceAuthorization,
  ThresholdCustodyPolicy,
} from '../../types/privacy';

// Mock data for shielded treasury
const MOCK_SHIELDED_VAULTS: ShieldedVault[] = [
  {
    vaultId: 'shielded-main',
    ownerId: 'treasury',
    chain: 'lux-z',
    aggregateBalance: BigInt(10_000_000e18),
    asset: 'USDC',
    custodyPolicy: {
      threshold: 5,
      totalSigners: 9,
      requiresGovernanceAuth: true,
      rateLimits: {
        maxPerTransaction: BigInt(500_000e18),
        maxPerDay: BigInt(2_000_000e18),
        cooldownMinutes: 60,
      },
    },
    viewKeyHolders: ['impact-dao', 'security-dao', 'treasury-dao'],
  },
  ...PARS_10_DAOS.slice(0, 5).map((dao) => ({
    vaultId: `shielded-${dao.id}`,
    ownerId: dao.id,
    chain: 'lux-z' as const,
    aggregateBalance: BigInt((100_000 + Math.random() * 400_000) * 1e18),
    asset: 'USDC',
    custodyPolicy: {
      threshold: 3,
      totalSigners: 5,
      requiresGovernanceAuth: true,
      rateLimits: {
        maxPerTransaction: BigInt(50_000e18),
        maxPerDay: BigInt(200_000e18),
        cooldownMinutes: 30,
      },
    },
    viewKeyHolders: ['impact-dao', dao.id],
  })),
];

const MOCK_AUTHORIZATIONS: GovernanceAuthorization[] = [
  {
    authorizationId: 'auth-001',
    scopeId: 'health',
    cap: BigInt(500_000e18),
    asset: 'USDC',
    expiry: Date.now() + 90 * 24 * 60 * 60 * 1000, // 90 days
    constraints: {
      allowedAssets: ['USDC', 'DAI'],
      allowedCategories: ['medical-supplies', 'clinic-operations', 'emergency-aid'],
      allowedOperators: ['health-operator-1', 'health-operator-2'],
    },
    proposalId: 'prop-health-001',
    status: 'active',
  },
  {
    authorizationId: 'auth-002',
    scopeId: 'infrastructure',
    cap: BigInt(250_000e18),
    asset: 'USDC',
    expiry: Date.now() + 60 * 24 * 60 * 60 * 1000, // 60 days
    constraints: {
      allowedAssets: ['USDC'],
      allowedCategories: ['network-ops', 'hardware', 'hosting'],
      allowedOperators: ['infra-operator-1'],
    },
    proposalId: 'prop-infra-001',
    status: 'active',
  },
];

function formatUSD(value: bigint): string {
  const num = Number(formatEther(value));
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(num);
}

function ShieldedVaultCard({ vault }: { vault: ShieldedVault }) {
  const dao = PARS_10_DAOS.find(d => d.id === vault.ownerId);

  return (
    <Box
      p={4}
      bg="color-neutral-800"
      borderRadius="lg"
      border="1px solid"
      borderColor="green.800"
    >
      <HStack justify="space-between" mb={3}>
        <HStack spacing={2}>
          <Icon as={Shield} color="green.400" />
          <Text textStyle="text-sm-medium" color="white">
            {dao?.name || vault.ownerId}
          </Text>
        </HStack>
        <Badge colorScheme="green" fontSize="10px">
          <HStack spacing={1}>
            <Icon as={Lock} boxSize={2} />
            <Text>Shielded</Text>
          </HStack>
        </Badge>
      </HStack>

      <Text textStyle="text-xl-medium" color="white" mb={2}>
        {formatUSD(vault.aggregateBalance)}
      </Text>

      <HStack spacing={4} mb={3}>
        <Box>
          <Text textStyle="text-xs-regular" color="color-neutral-400">
            Threshold
          </Text>
          <Text textStyle="text-sm-medium" color="white">
            {vault.custodyPolicy.threshold}/{vault.custodyPolicy.totalSigners}
          </Text>
        </Box>
        <Box>
          <Text textStyle="text-xs-regular" color="color-neutral-400">
            Max/Tx
          </Text>
          <Text textStyle="text-sm-medium" color="white">
            {formatUSD(vault.custodyPolicy.rateLimits.maxPerTransaction)}
          </Text>
        </Box>
      </HStack>

      <HStack spacing={1}>
        <Icon as={Eye} boxSize={3} color="color-neutral-500" />
        <Text textStyle="text-xs-regular" color="color-neutral-500">
          {vault.viewKeyHolders.length} view key holders
        </Text>
      </HStack>
    </Box>
  );
}

function AuthorizationCard({ auth }: { auth: GovernanceAuthorization }) {
  const dao = PARS_10_DAOS.find(d => d.id === auth.scopeId);
  const daysRemaining = Math.ceil((auth.expiry - Date.now()) / (24 * 60 * 60 * 1000));
  const isExpiringSoon = daysRemaining < 14;

  return (
    <Box
      p={4}
      bg="color-neutral-800"
      borderRadius="lg"
      border="1px solid"
      borderColor={isExpiringSoon ? 'yellow.600' : 'color-neutral-700'}
    >
      <HStack justify="space-between" mb={2}>
        <HStack spacing={2}>
          <Icon as={CheckCircle} color="green.400" />
          <Text textStyle="text-sm-medium" color="white">
            {dao?.name || auth.scopeId}
          </Text>
        </HStack>
        <Badge colorScheme={auth.status === 'active' ? 'green' : 'gray'}>
          {auth.status}
        </Badge>
      </HStack>

      <Text textStyle="text-lg-medium" color="color-gold-400" mb={2}>
        {formatUSD(auth.cap)} cap
      </Text>

      <VStack align="stretch" spacing={2}>
        <HStack justify="space-between">
          <Text textStyle="text-xs-regular" color="color-neutral-400">
            Categories
          </Text>
          <HStack spacing={1}>
            {auth.constraints.allowedCategories.slice(0, 2).map(cat => (
              <Badge key={cat} colorScheme="purple" fontSize="10px">
                {cat}
              </Badge>
            ))}
            {auth.constraints.allowedCategories.length > 2 && (
              <Badge colorScheme="gray" fontSize="10px">
                +{auth.constraints.allowedCategories.length - 2}
              </Badge>
            )}
          </HStack>
        </HStack>

        <HStack justify="space-between">
          <Text textStyle="text-xs-regular" color="color-neutral-400">
            Operators
          </Text>
          <Text textStyle="text-xs-medium" color="white">
            {auth.constraints.allowedOperators.length} authorized
          </Text>
        </HStack>

        <HStack justify="space-between">
          <HStack spacing={1}>
            <Icon
              as={isExpiringSoon ? Warning : Clock}
              boxSize={3}
              color={isExpiringSoon ? 'yellow.400' : 'color-neutral-400'}
            />
            <Text
              textStyle="text-xs-regular"
              color={isExpiringSoon ? 'yellow.400' : 'color-neutral-400'}
            >
              {daysRemaining} days remaining
            </Text>
          </HStack>
          <Text textStyle="text-xs-regular" color="color-neutral-500">
            via {auth.proposalId}
          </Text>
        </HStack>
      </VStack>
    </Box>
  );
}

export function ShieldedTreasuryTab() {
  const totalShielded = MOCK_SHIELDED_VAULTS.reduce(
    (sum, v) => sum + v.aggregateBalance,
    0n
  );

  const totalAuthorizedCap = MOCK_AUTHORIZATIONS
    .filter(a => a.status === 'active')
    .reduce((sum, a) => sum + a.cap, 0n);

  return (
    <VStack align="stretch" spacing={6}>
      {/* Privacy Notice */}
      <Alert
        status="info"
        bg="green.900"
        borderRadius="lg"
        border="1px solid"
        borderColor="green.700"
      >
        <AlertIcon color="green.400" />
        <Box>
          <Text textStyle="text-sm-medium" color="green.200">
            Shielded Treasury (Lux Z-Chain)
          </Text>
          <Text textStyle="text-xs-regular" color="green.300">
            Only aggregate balances and authorized program caps are shown. Individual recipients and transaction details are private.
          </Text>
        </Box>
      </Alert>

      {/* Aggregate Stats */}
      <Box
        p={6}
        bg="color-neutral-900"
        borderRadius="lg"
        border="1px solid"
        borderColor="green.800"
      >
        <HStack spacing={2} mb={4}>
          <Icon as={Shield} color="green.400" boxSize={5} />
          <Text textStyle="text-lg-medium" color="white">
            Shielded Holdings (Aggregate)
          </Text>
          <Badge colorScheme="purple">Lux Z-Chain (zkvm)</Badge>
        </HStack>

        <Grid templateColumns={['1fr', 'repeat(2, 1fr)', 'repeat(4, 1fr)']} gap={4}>
          <Stat>
            <StatLabel color="color-neutral-400">Total Shielded</StatLabel>
            <StatNumber color="green.400">{formatUSD(totalShielded)}</StatNumber>
            <StatHelpText color="color-neutral-500">
              Across {MOCK_SHIELDED_VAULTS.length} vaults
            </StatHelpText>
          </Stat>

          <Stat>
            <StatLabel color="color-neutral-400">Active Authorizations</StatLabel>
            <StatNumber color="white">{MOCK_AUTHORIZATIONS.filter(a => a.status === 'active').length}</StatNumber>
            <StatHelpText color="color-neutral-500">
              {formatUSD(totalAuthorizedCap)} total cap
            </StatHelpText>
          </Stat>

          <Stat>
            <StatLabel color="color-neutral-400">Custody Model</StatLabel>
            <StatNumber color="white">5/9</StatNumber>
            <StatHelpText color="color-neutral-500">
              Threshold signatures
            </StatHelpText>
          </Stat>

          <Stat>
            <StatLabel color="color-neutral-400">View Key Holders</StatLabel>
            <StatNumber color="white">3</StatNumber>
            <StatHelpText color="color-neutral-500">
              Impact, Security, Treasury
            </StatHelpText>
          </Stat>
        </Grid>
      </Box>

      {/* Shielded Vaults */}
      <Box>
        <HStack justify="space-between" mb={4}>
          <HStack spacing={2}>
            <Icon as={Vault} color="green.400" />
            <Text textStyle="text-md-medium" color="white">
              Shielded Vaults
            </Text>
          </HStack>
          <Badge colorScheme="green">{MOCK_SHIELDED_VAULTS.length} vaults</Badge>
        </HStack>

        <Grid templateColumns={['1fr', 'repeat(2, 1fr)', 'repeat(3, 1fr)']} gap={4}>
          {MOCK_SHIELDED_VAULTS.map(vault => (
            <ShieldedVaultCard key={vault.vaultId} vault={vault} />
          ))}
        </Grid>
      </Box>

      {/* Active Authorizations */}
      <Box>
        <HStack justify="space-between" mb={4}>
          <HStack spacing={2}>
            <Icon as={CheckCircle} color="green.400" />
            <Text textStyle="text-md-medium" color="white">
              Active Authorizations
            </Text>
          </HStack>
          <Tooltip label="Governance-approved spending caps for programs">
            <Badge colorScheme="purple">Program Caps</Badge>
          </Tooltip>
        </HStack>

        <Text textStyle="text-sm-regular" color="color-neutral-400" mb={4}>
          These authorizations allow operators to execute confidential disbursements within approved limits.
          No recipient details are visible.
        </Text>

        <Grid templateColumns={['1fr', 'repeat(2, 1fr)']} gap={4}>
          {MOCK_AUTHORIZATIONS.map(auth => (
            <AuthorizationCard key={auth.authorizationId} auth={auth} />
          ))}
        </Grid>
      </Box>

      {/* What's Hidden Notice */}
      <Box
        p={4}
        bg="color-neutral-900"
        borderRadius="lg"
        border="1px solid"
        borderColor="color-neutral-800"
      >
        <HStack spacing={2} mb={3}>
          <Icon as={EyeSlash} color="color-neutral-400" />
          <Text textStyle="text-sm-medium" color="white">
            What's Protected
          </Text>
        </HStack>

        <Grid templateColumns={['1fr', 'repeat(2, 1fr)', 'repeat(4, 1fr)']} gap={3}>
          <HStack spacing={2}>
            <Icon as={Lock} boxSize={3} color="green.400" />
            <Text textStyle="text-xs-regular" color="color-neutral-300">
              Recipient addresses
            </Text>
          </HStack>
          <HStack spacing={2}>
            <Icon as={Lock} boxSize={3} color="green.400" />
            <Text textStyle="text-xs-regular" color="color-neutral-300">
              Individual tx amounts
            </Text>
          </HStack>
          <HStack spacing={2}>
            <Icon as={Lock} boxSize={3} color="green.400" />
            <Text textStyle="text-xs-regular" color="color-neutral-300">
              Beneficiary identities
            </Text>
          </HStack>
          <HStack spacing={2}>
            <Icon as={Lock} boxSize={3} color="green.400" />
            <Text textStyle="text-xs-regular" color="color-neutral-300">
              Operator tx linkage
            </Text>
          </HStack>
        </Grid>
      </Box>
    </VStack>
  );
}
