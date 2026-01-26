import { Box, Flex, Grid, GridItem, Icon, Text, Badge, Progress, HStack, VStack, Tooltip } from '@chakra-ui/react';
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
  ArrowUpRight,
  Info,
} from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PARS_10_DAOS, CATEGORY_INFO, SubDAO, getFundingSummary, CYRUS_MAIN_DAO } from '../../types/daoHierarchy';

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

// Status badge colors
const statusColors: Record<string, string> = {
  active: 'green',
  bootstrap: 'yellow',
  'coming-soon': 'purple',
};

const statusLabels: Record<string, string> = {
  active: 'Active',
  bootstrap: 'Bootstrap',
  'coming-soon': 'Coming Soon',
};

// Governance type labels
const governanceLabels: Record<string, string> = {
  multisig: 'Multisig',
  'token-voting': 'Token Voting',
  hybrid: 'Hybrid',
  guardian: 'Guardian Council',
};

interface PARS10CardProps {
  dao: SubDAO;
}

function PARS10Card({ dao }: PARS10CardProps) {
  const categoryInfo = CATEGORY_INFO[dao.category];
  const IconComponent = iconMap[dao.icon] || Buildings;

  // All DAOs link to their detail page
  const internalRoute = `/dao-network/${dao.id}`;
  const isClickable = dao.status !== 'coming-soon';

  const content = (
    <GridItem
      p={5}
      bg="color-neutral-950"
      borderRadius="lg"
      cursor={isClickable ? 'pointer' : 'default'}
      border="1px solid"
      borderColor={dao.status === 'active' ? 'color-gold-400' : 'transparent'}
      _hover={
        isClickable
          ? {
              backgroundColor: 'color-neutral-900',
              border: '1px solid',
              borderColor: 'color-gold-400',
              transform: 'translateY(-2px)',
            }
          : {}
      }
      transition="all 300ms ease-in-out"
      position="relative"
      opacity={dao.status === 'coming-soon' ? 0.7 : 1}
    >
      {/* Status Badge */}
      <Badge
        position="absolute"
        top={3}
        right={3}
        colorScheme={statusColors[dao.status]}
        fontSize="xs"
        px={2}
        py={0.5}
        borderRadius="full"
      >
        {statusLabels[dao.status]}
      </Badge>

      <VStack align="start" spacing={3}>
        {/* Header */}
        <Flex align="center" justify="space-between" w="full">
          <Flex
            align="center"
            justify="center"
            w={10}
            h={10}
            borderRadius="lg"
            bg={`${categoryInfo.color}.500`}
            color="white"
          >
            <Icon as={IconComponent} boxSize={5} />
          </Flex>
          {isClickable && (
            <Icon as={ArrowUpRight} boxSize={4} color="color-neutral-400" />
          )}
        </Flex>

        {/* Name with Persian */}
        <Box>
          <HStack spacing={2} mb={1}>
            <Text textStyle="text-md-medium" color="white">
              {dao.name}
            </Text>
            <Text textStyle="text-sm-regular" color="color-neutral-400" dir="rtl">
              {dao.persianName}
            </Text>
          </HStack>
          <Badge
            colorScheme={categoryInfo.color}
            fontSize="xs"
            px={2}
            py={0.5}
            borderRadius="full"
            textTransform="capitalize"
          >
            {categoryInfo.label}
          </Badge>
        </Box>

        {/* Mandate */}
        <Text textStyle="text-xs-regular" color="color-neutral-300" noOfLines={2}>
          {dao.mandate}
        </Text>

        {/* Funding Allocation */}
        <Box w="full">
          <HStack justify="space-between" mb={1}>
            <Text textStyle="text-xs-regular" color="color-neutral-400">
              WT Allocation
            </Text>
            <Text textStyle="text-xs-medium" color="color-gold-400">
              {dao.workingTreasuryPercent}%
            </Text>
          </HStack>
          <Progress
            value={dao.workingTreasuryPercent}
            max={20}
            size="xs"
            colorScheme="yellow"
            bg="color-neutral-800"
            borderRadius="full"
          />
        </Box>

        {/* Governance Type */}
        <HStack spacing={2}>
          <Badge variant="outline" colorScheme="gray" fontSize="xs">
            {governanceLabels[dao.governanceType]}
          </Badge>
          {dao.hasEndowmentRole && (
            <Tooltip label="Manages Endowment funds" placement="top">
              <Badge variant="outline" colorScheme="purple" fontSize="xs">
                END Steward
              </Badge>
            </Tooltip>
          )}
        </HStack>
      </VStack>
    </GridItem>
  );

  if (!isClickable) {
    return content;
  }

  return <Link to={internalRoute}>{content}</Link>;
}

function FundingSummaryBar() {
  const summary = getFundingSummary();

  return (
    <Box
      bg="color-neutral-900"
      p={4}
      borderRadius="lg"
      border="1px solid"
      borderColor="color-neutral-800"
      mb={4}
    >
      <HStack justify="space-between" mb={3}>
        <HStack>
          <Icon as={Info} color="color-gold-400" />
          <Text textStyle="text-sm-medium" color="white">
            Working Treasury Allocation
          </Text>
        </HStack>
        <Text textStyle="text-sm-medium" color="color-gold-400">
          {summary.totalPercent}% allocated
        </Text>
      </HStack>

      {/* Stacked bar showing allocations */}
      <Flex h={3} borderRadius="full" overflow="hidden" bg="color-neutral-800">
        {PARS_10_DAOS.map((dao, index) => {
          const categoryInfo = CATEGORY_INFO[dao.category];
          return (
            <Tooltip key={dao.id} label={`${dao.name}: ${dao.workingTreasuryPercent}%`}>
              <Box
                h="full"
                w={`${dao.workingTreasuryPercent}%`}
                bg={`${categoryInfo.color}.500`}
                _hover={{ opacity: 0.8 }}
                transition="opacity 200ms"
              />
            </Tooltip>
          );
        })}
      </Flex>

      {/* Legend */}
      <Flex flexWrap="wrap" gap={2} mt={3}>
        {PARS_10_DAOS.slice(0, 5).map(dao => {
          const categoryInfo = CATEGORY_INFO[dao.category];
          return (
            <HStack key={dao.id} spacing={1}>
              <Box w={2} h={2} borderRadius="full" bg={`${categoryInfo.color}.500`} />
              <Text textStyle="text-xs-regular" color="color-neutral-400">
                {dao.persianName} {dao.workingTreasuryPercent}%
              </Text>
            </HStack>
          );
        })}
      </Flex>
    </Box>
  );
}

export function FeaturedDAOs() {
  const { t } = useTranslation('home');

  return (
    <Flex direction="column" gap="1.5rem">
      {/* Header */}
      <Flex align="center" justify="space-between" flexWrap="wrap" gap={2}>
        <Box>
          <HStack spacing={2} mb={1}>
            <Text textStyle="text-xl-regular" color="white">
              {t('featuredDAOs', 'PARS-10 DAO Network')}
            </Text>
            <Text textStyle="text-lg-regular" color="color-neutral-400" dir="rtl">
              شبکه ده‌گانه پارس
            </Text>
          </HStack>
          <Text textStyle="text-sm-regular" color="color-neutral-400">
            {t('daoNetworkDescription', 'On-chain NGO operating system with Working Treasury and Endowment buckets.')}
          </Text>
        </Box>
        <VStack align="end" spacing={1}>
          <Badge colorScheme="yellow" fontSize="sm" px={3} py={1}>
            10 Sub-DAOs
          </Badge>
          <Text textStyle="text-xs-regular" color="color-neutral-500">
            WT: 24mo runway | END: 60% locked
          </Text>
        </VStack>
      </Flex>

      {/* Funding Summary */}
      <FundingSummaryBar />

      {/* DAO Grid */}
      <Grid
        templateColumns={['1fr', '1fr', 'repeat(2, 1fr)', 'repeat(3, 1fr)', 'repeat(5, 1fr)']}
        gap={4}
      >
        {PARS_10_DAOS.map(dao => (
          <PARS10Card key={dao.id} dao={dao} />
        ))}
      </Grid>

      {/* LiquidPARS CTA */}
      <Link to="/liquid">
        <Box
          bg="linear-gradient(135deg, color-neutral-900 0%, color-neutral-800 100%)"
          p={4}
          borderRadius="lg"
          border="1px solid"
          borderColor="color-gold-400"
          cursor="pointer"
          _hover={{
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 20px rgba(212, 175, 55, 0.2)',
          }}
          transition="all 300ms ease-in-out"
        >
          <HStack justify="space-between">
            <HStack spacing={3}>
              <Icon as={Vault} color="color-gold-400" boxSize={6} />
              <Box>
                <HStack spacing={2}>
                  <Text textStyle="text-md-medium" color="white">
                    LiquidPARS Vault
                  </Text>
                  <Text textStyle="text-sm-regular" color="color-neutral-400" dir="rtl">
                    پارس مایع
                  </Text>
                </HStack>
                <Text textStyle="text-xs-regular" color="color-neutral-400">
                  Yield-bearing xPARS with Shariah-compliant strategies
                </Text>
              </Box>
            </HStack>
            <HStack spacing={4}>
              <Box textAlign="right">
                <Text textStyle="text-xs-regular" color="color-neutral-400">Expected APY</Text>
                <Text textStyle="text-md-medium" color="color-gold-400">3-8%</Text>
              </Box>
              <Icon as={ArrowUpRight} boxSize={5} color="color-gold-400" />
            </HStack>
          </HStack>
        </Box>
      </Link>

      {/* Endowment Rules Note */}
      <Box
        bg="color-neutral-900"
        p={4}
        borderRadius="lg"
        border="1px solid"
        borderColor="color-neutral-800"
      >
        <HStack spacing={2} mb={2}>
          <Icon as={Vault} color="color-gold-400" />
          <Text textStyle="text-sm-medium" color="white">
            Endowment Rules (Institution-Ready)
          </Text>
        </HStack>
        <Grid templateColumns={['1fr', '1fr', 'repeat(2, 1fr)', 'repeat(4, 1fr)']} gap={4}>
          <Box>
            <Text textStyle="text-xs-regular" color="color-neutral-400">Max Quarterly Deploy</Text>
            <Text textStyle="text-sm-medium" color="white">5%</Text>
          </Box>
          <Box>
            <Text textStyle="text-xs-regular" color="color-neutral-400">Large Deploy Threshold</Text>
            <Text textStyle="text-sm-medium" color="white">2% (requires ratification)</Text>
          </Box>
          <Box>
            <Text textStyle="text-xs-regular" color="color-neutral-400">Risk Buckets</Text>
            <Text textStyle="text-sm-medium" color="white">Cash, Blue-chip, Strategic, Venture</Text>
          </Box>
          <Box>
            <Text textStyle="text-xs-regular" color="color-neutral-400">Timelocks</Text>
            <Text textStyle="text-sm-medium" color="white">3-30 days by size</Text>
          </Box>
        </Grid>
      </Box>
    </Flex>
  );
}
