import {
  Box,
  Button,
  Flex,
  Grid,
  HStack,
  VStack,
  Text,
  Icon,
  Badge,
  Progress,
  Input,
  InputGroup,
  InputRightAddon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
  Alert,
  AlertIcon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from '@chakra-ui/react';
import {
  Bank,
  ArrowUp,
  ArrowDown,
  Info,
  Vault,
  Coins,
  Lightning,
  TrendUp,
  TrendDown,
  ArrowRight,
  Leaf,
} from '@phosphor-icons/react';
import { useState, useMemo } from 'react';
import { parseUnits } from 'viem';
import { useAccount } from 'wagmi';

import { useLendingMarkets } from '../../hooks/useLendingMarkets';
import {
  LendingMarket,
  formatAPY,
  formatTVL,
  formatUtilization,
  getHealthFactorColor,
  getHealthFactorLabel,
} from '../../types/lending';

// ============================================================================
// STATS OVERVIEW
// ============================================================================

function LendingStatsOverview() {
  const { stats, isLoading } = useLendingMarkets();

  if (isLoading) {
    return (
      <Box bg="neutral.900" p={6} borderRadius="lg" border="1px solid" borderColor="neutral.800">
        <Flex justify="center" align="center" py={4}>
          <Spinner color="gold.400" />
        </Flex>
      </Box>
    );
  }

  return (
    <Box bg="neutral.900" p={6} borderRadius="lg" border="1px solid" borderColor="neutral.800">
      <HStack spacing={2} mb={4}>
        <Icon as={Bank} color="gold.400" boxSize={5} />
        <Text textStyle="text-lg-medium" color="white">
          Lending Protocol Overview
        </Text>
        <Badge colorScheme="green">Lux Liquid</Badge>
      </HStack>

      <Grid templateColumns={['1fr', '1fr', 'repeat(2, 1fr)', 'repeat(4, 1fr)']} gap={4}>
        <Stat>
          <StatLabel color="neutral.400">Total Value Locked</StatLabel>
          <StatNumber color="white">{formatTVL(stats.totalTVL)}</StatNumber>
          <StatHelpText color="green.400">
            <StatArrow type="increase" />
            Across {stats.activeMarkets} markets
          </StatHelpText>
        </Stat>

        <Stat>
          <StatLabel color="neutral.400">Total Borrowed</StatLabel>
          <StatNumber color="white">{formatTVL(stats.totalBorrowed)}</StatNumber>
          <StatHelpText color="neutral.500">
            {((stats.totalBorrowed / stats.totalTVL) * 100).toFixed(1)}% utilization
          </StatHelpText>
        </Stat>

        <Stat>
          <StatLabel color="neutral.400">Unique Suppliers</StatLabel>
          <StatNumber color="white">{stats.uniqueSuppliers.toLocaleString()}</StatNumber>
          <StatHelpText color="neutral.500">Active lenders</StatHelpText>
        </Stat>

        <Stat>
          <StatLabel color="neutral.400">Unique Borrowers</StatLabel>
          <StatNumber color="white">{stats.uniqueBorrowers.toLocaleString()}</StatNumber>
          <StatHelpText color="neutral.500">Active positions</StatHelpText>
        </Stat>
      </Grid>
    </Box>
  );
}

// ============================================================================
// MARKET ROW COMPONENT
// ============================================================================

interface MarketRowProps {
  market: LendingMarket;
  onSelect: (market: LendingMarket) => void;
}

function MarketRow({ market, onSelect }: MarketRowProps) {
  const availableUSD = useMemo(() => {
    const borrowDecimals = market.borrowAsset.decimals;
    return Number(market.availableToBorrow) / 10 ** borrowDecimals;
  }, [market]);

  return (
    <Tr
      _hover={{ bg: 'neutral.850' }}
      cursor="pointer"
      onClick={() => onSelect(market)}
      transition="background 150ms ease"
    >
      {/* Market/Pair */}
      <Td>
        <HStack spacing={3}>
          <VStack align="start" spacing={0}>
            <HStack spacing={2}>
              <Text textStyle="text-sm-medium" color="white">
                {market.collateral.symbol}
              </Text>
              <Icon as={ArrowRight} color="neutral.500" boxSize={3} />
              <Text textStyle="text-sm-medium" color="gold.400">
                {market.borrowAsset.symbol}
              </Text>
            </HStack>
            <HStack spacing={2}>
              {market.shariahCompliant && (
                <Badge colorScheme="green" size="sm" fontSize="xs">
                  <HStack spacing={1}>
                    <Icon as={Leaf} boxSize={2} />
                    <Text>Halal</Text>
                  </HStack>
                </Badge>
              )}
              <Text textStyle="text-xs-regular" color="neutral.500">
                {market.protocol}
              </Text>
            </HStack>
          </VStack>
        </HStack>
      </Td>

      {/* Supply APY */}
      <Td>
        <VStack align="end" spacing={0}>
          <HStack spacing={1}>
            <Icon as={TrendUp} color="green.400" boxSize={3} />
            <Text textStyle="text-sm-medium" color="green.400">
              {formatAPY(market.supplyAPY)}
            </Text>
          </HStack>
          <Text textStyle="text-xs-regular" color="neutral.500">
            Supply
          </Text>
        </VStack>
      </Td>

      {/* Borrow APY */}
      <Td>
        <VStack align="end" spacing={0}>
          <HStack spacing={1}>
            <Icon as={TrendDown} color="yellow.400" boxSize={3} />
            <Text textStyle="text-sm-medium" color="yellow.400">
              {formatAPY(market.borrowAPY)}
            </Text>
          </HStack>
          <Text textStyle="text-xs-regular" color="neutral.500">
            Borrow
          </Text>
        </VStack>
      </Td>

      {/* TVL */}
      <Td>
        <VStack align="end" spacing={0}>
          <Text textStyle="text-sm-medium" color="white">
            {formatTVL(market.tvlUSD)}
          </Text>
          <Text textStyle="text-xs-regular" color="neutral.500">
            TVL
          </Text>
        </VStack>
      </Td>

      {/* Available to Borrow */}
      <Td>
        <VStack align="end" spacing={0}>
          <Text textStyle="text-sm-medium" color="white">
            {formatTVL(availableUSD)}
          </Text>
          <Text textStyle="text-xs-regular" color="neutral.500">
            Available
          </Text>
        </VStack>
      </Td>

      {/* Utilization */}
      <Td>
        <VStack align="end" spacing={1} w="100px">
          <Text textStyle="text-sm-medium" color="white">
            {formatUtilization(market.utilizationRate)}
          </Text>
          <Progress
            value={market.utilizationRate * 100}
            size="xs"
            colorScheme={market.utilizationRate > 0.8 ? 'red' : market.utilizationRate > 0.6 ? 'yellow' : 'green'}
            w="full"
            borderRadius="full"
            bg="neutral.700"
          />
        </VStack>
      </Td>

      {/* LTV */}
      <Td>
        <Text textStyle="text-sm-medium" color="neutral.300">
          {(market.ltv * 100).toFixed(0)}%
        </Text>
      </Td>

      {/* Action */}
      <Td>
        <Button
          size="sm"
          variant="outline"
          borderColor="gold.400"
          color="gold.400"
          _hover={{ bg: 'gold.400', color: 'neutral.950' }}
          rightIcon={<Icon as={ArrowRight} />}
        >
          Enter
        </Button>
      </Td>
    </Tr>
  );
}

// ============================================================================
// MARKET MODAL
// ============================================================================

interface MarketModalProps {
  market: LendingMarket;
  isOpen: boolean;
  onClose: () => void;
}

function MarketModal({ market, isOpen, onClose }: MarketModalProps) {
  const { isConnected } = useAccount();
  const { supply, depositCollateral, withdrawCollateral, repay, isPending } = useLendingMarkets();
  const [amount, setAmount] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  const handleAction = async () => {
    if (!amount) return;

    const parsedAmount = parseUnits(amount, market.borrowAsset.decimals);

    try {
      switch (activeTab) {
        case 0: // Supply
          await supply(market.id, parsedAmount);
          break;
        case 1: // Borrow
          await depositCollateral(market.id, parsedAmount);
          break;
        case 2: // Repay
          await repay(market.id, parsedAmount);
          break;
        case 3: // Withdraw
          await withdrawCollateral(market.id, parsedAmount);
          break;
      }
      setAmount('');
    } catch (e) {
      console.error('Action failed:', e);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay bg="blackAlpha.800" backdropFilter="blur(8px)" />
      <ModalContent bg="neutral.950" borderColor="neutral.800" borderWidth={1}>
        <ModalHeader color="white">
          <HStack>
            <Icon as={Bank} color="gold.400" />
            <Text>
              {market.collateral.symbol} / {market.borrowAsset.symbol}
            </Text>
            {market.shariahCompliant && (
              <Badge colorScheme="green">
                <HStack spacing={1}>
                  <Icon as={Leaf} boxSize={3} />
                  <Text>Halal</Text>
                </HStack>
              </Badge>
            )}
          </HStack>
        </ModalHeader>
        <ModalCloseButton color="neutral.400" />

        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Market Info */}
            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <Box bg="neutral.900" p={4} borderRadius="lg">
                <HStack justify="space-between" mb={2}>
                  <Text textStyle="text-xs-regular" color="neutral.400">
                    Supply APY
                  </Text>
                  <Text textStyle="text-lg-medium" color="green.400">
                    {formatAPY(market.supplyAPY)}
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text textStyle="text-xs-regular" color="neutral.400">
                    TVL
                  </Text>
                  <Text textStyle="text-sm-medium" color="white">
                    {formatTVL(market.tvlUSD)}
                  </Text>
                </HStack>
              </Box>

              <Box bg="neutral.900" p={4} borderRadius="lg">
                <HStack justify="space-between" mb={2}>
                  <Text textStyle="text-xs-regular" color="neutral.400">
                    Borrow APY
                  </Text>
                  <Text textStyle="text-lg-medium" color="yellow.400">
                    {formatAPY(market.borrowAPY)}
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text textStyle="text-xs-regular" color="neutral.400">
                    Available
                  </Text>
                  <Text textStyle="text-sm-medium" color="white">
                    {formatTVL(
                      Number(market.availableToBorrow) / 10 ** market.borrowAsset.decimals,
                    )}
                  </Text>
                </HStack>
              </Box>
            </Grid>

            {/* Risk Parameters */}
            <Box bg="neutral.900" p={4} borderRadius="lg">
              <Text textStyle="text-sm-medium" color="white" mb={3}>
                Risk Parameters
              </Text>
              <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                <VStack align="center" spacing={1}>
                  <Text textStyle="text-xl-medium" color="white">
                    {(market.ltv * 100).toFixed(0)}%
                  </Text>
                  <Text textStyle="text-xs-regular" color="neutral.400">
                    Max LTV
                  </Text>
                </VStack>
                <VStack align="center" spacing={1}>
                  <Text textStyle="text-xl-medium" color="white">
                    {(market.liquidationThreshold * 100).toFixed(0)}%
                  </Text>
                  <Text textStyle="text-xs-regular" color="neutral.400">
                    Liquidation
                  </Text>
                </VStack>
                <VStack align="center" spacing={1}>
                  <Text textStyle="text-xl-medium" color="white">
                    {(market.liquidationPenalty * 100).toFixed(0)}%
                  </Text>
                  <Text textStyle="text-xs-regular" color="neutral.400">
                    Penalty
                  </Text>
                </VStack>
              </Grid>
            </Box>

            {/* Shariah Note */}
            {market.shariahCompliant && market.shariahNotes && (
              <Alert status="success" bg="green.900" borderRadius="lg" border="1px solid" borderColor="green.700">
                <AlertIcon color="green.400" />
                <Box>
                  <Text textStyle="text-sm-medium" color="white">
                    Shariah-Compliant
                  </Text>
                  <Text textStyle="text-xs-regular" color="neutral.300">
                    {market.shariahNotes}
                  </Text>
                </Box>
              </Alert>
            )}

            <Divider borderColor="neutral.800" />

            {/* Action Tabs */}
            <Tabs variant="soft-rounded" colorScheme="yellow" size="sm" onChange={setActiveTab}>
              <TabList mb={4}>
                <Tab>
                  <HStack spacing={1}>
                    <Icon as={ArrowDown} />
                    <Text>Supply</Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack spacing={1}>
                    <Icon as={Coins} />
                    <Text>Borrow</Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack spacing={1}>
                    <Icon as={ArrowUp} />
                    <Text>Repay</Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack spacing={1}>
                    <Icon as={Vault} />
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
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        type="number"
                        bg="neutral.800"
                        border="none"
                      />
                      <InputRightAddon bg="neutral.700" border="none">
                        {market.borrowAsset.symbol}
                      </InputRightAddon>
                    </InputGroup>
                    <Text textStyle="text-xs-regular" color="neutral.500">
                      Supply {market.borrowAsset.symbol} to earn {formatAPY(market.supplyAPY)} APY
                    </Text>
                  </VStack>
                </TabPanel>

                <TabPanel p={0}>
                  <VStack spacing={3}>
                    <InputGroup size="md">
                      <Input
                        placeholder="Collateral Amount"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        type="number"
                        bg="neutral.800"
                        border="none"
                      />
                      <InputRightAddon bg="neutral.700" border="none">
                        {market.collateral.symbol}
                      </InputRightAddon>
                    </InputGroup>
                    <Text textStyle="text-xs-regular" color="neutral.500">
                      Deposit {market.collateral.symbol} as collateral to borrow {market.borrowAsset.symbol}
                    </Text>
                  </VStack>
                </TabPanel>

                <TabPanel p={0}>
                  <VStack spacing={3}>
                    <InputGroup size="md">
                      <Input
                        placeholder="Repay Amount"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        type="number"
                        bg="neutral.800"
                        border="none"
                      />
                      <InputRightAddon bg="neutral.700" border="none">
                        {market.borrowAsset.symbol}
                      </InputRightAddon>
                    </InputGroup>
                    <Text textStyle="text-xs-regular" color="neutral.500">
                      Repay borrowed {market.borrowAsset.symbol} to increase health factor
                    </Text>
                  </VStack>
                </TabPanel>

                <TabPanel p={0}>
                  <VStack spacing={3}>
                    <InputGroup size="md">
                      <Input
                        placeholder="Withdraw Amount"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        type="number"
                        bg="neutral.800"
                        border="none"
                      />
                      <InputRightAddon bg="neutral.700" border="none">
                        {market.collateral.symbol}
                      </InputRightAddon>
                    </InputGroup>
                    <Text textStyle="text-xs-regular" color="neutral.500">
                      Withdraw {market.collateral.symbol} collateral (must maintain health factor)
                    </Text>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={4} w="full">
            <Button variant="ghost" onClick={onClose} flex={1}>
              Cancel
            </Button>
            <Button
              bg="gold.400"
              color="neutral.950"
              _hover={{ bg: 'gold.300' }}
              flex={2}
              isLoading={isPending}
              isDisabled={!isConnected || !amount}
              onClick={handleAction}
              rightIcon={<Icon as={Lightning} />}
            >
              {isConnected
                ? activeTab === 0
                  ? 'Supply'
                  : activeTab === 1
                    ? 'Deposit & Borrow'
                    : activeTab === 2
                      ? 'Repay'
                      : 'Withdraw'
                : 'Connect Wallet'}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// ============================================================================
// MARKETS TABLE
// ============================================================================

function MarketsTable() {
  const { markets, setSelectedMarket } = useLendingMarkets();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedMarketForModal, setSelectedMarketForModal] = useState<LendingMarket | null>(null);

  const handleSelectMarket = (market: LendingMarket) => {
    setSelectedMarketForModal(market);
    setSelectedMarket(market);
    onOpen();
  };

  return (
    <Box bg="neutral.900" borderRadius="lg" border="1px solid" borderColor="neutral.800" overflow="hidden">
      <TableContainer>
        <Table variant="simple" size="md">
          <Thead bg="neutral.850">
            <Tr>
              <Th color="neutral.400" borderColor="neutral.700">
                Market
              </Th>
              <Th color="neutral.400" borderColor="neutral.700" isNumeric>
                Supply APY
              </Th>
              <Th color="neutral.400" borderColor="neutral.700" isNumeric>
                Borrow APY
              </Th>
              <Th color="neutral.400" borderColor="neutral.700" isNumeric>
                TVL
              </Th>
              <Th color="neutral.400" borderColor="neutral.700" isNumeric>
                Available
              </Th>
              <Th color="neutral.400" borderColor="neutral.700" isNumeric>
                Utilization
              </Th>
              <Th color="neutral.400" borderColor="neutral.700" isNumeric>
                Max LTV
              </Th>
              <Th color="neutral.400" borderColor="neutral.700"></Th>
            </Tr>
          </Thead>
          <Tbody>
            {markets.map(market => (
              <MarketRow key={market.id} market={market} onSelect={handleSelectMarket} />
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      {/* Market Modal */}
      {selectedMarketForModal && (
        <MarketModal market={selectedMarketForModal} isOpen={isOpen} onClose={onClose} />
      )}
    </Box>
  );
}

// ============================================================================
// USER POSITIONS
// ============================================================================

function UserPositions() {
  const { userPositions, isLoading } = useLendingMarkets();
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <Box bg="neutral.900" p={6} borderRadius="lg" border="1px solid" borderColor="neutral.800">
        <VStack spacing={4} py={4}>
          <Icon as={Vault} color="neutral.500" boxSize={10} />
          <Text color="neutral.400">Connect wallet to view your positions</Text>
        </VStack>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box bg="neutral.900" p={6} borderRadius="lg" border="1px solid" borderColor="neutral.800">
        <Flex justify="center" align="center" py={4}>
          <Spinner color="gold.400" />
        </Flex>
      </Box>
    );
  }

  if (userPositions.length === 0) {
    return (
      <Box bg="neutral.900" p={6} borderRadius="lg" border="1px solid" borderColor="neutral.800">
        <VStack spacing={4} py={4}>
          <Icon as={Coins} color="neutral.500" boxSize={10} />
          <Text color="neutral.400">No active positions</Text>
          <Text textStyle="text-xs-regular" color="neutral.500" textAlign="center">
            Supply assets or deposit collateral to borrow from a market above
          </Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box bg="neutral.900" borderRadius="lg" border="1px solid" borderColor="neutral.800" overflow="hidden">
      <HStack p={4} borderBottomWidth={1} borderColor="neutral.800">
        <Icon as={Coins} color="gold.400" boxSize={5} />
        <Text textStyle="text-lg-medium" color="white">
          Your Positions
        </Text>
      </HStack>

      <TableContainer>
        <Table variant="simple" size="sm">
          <Thead bg="neutral.850">
            <Tr>
              <Th color="neutral.400" borderColor="neutral.700">
                Market
              </Th>
              <Th color="neutral.400" borderColor="neutral.700" isNumeric>
                Collateral
              </Th>
              <Th color="neutral.400" borderColor="neutral.700" isNumeric>
                Borrowed
              </Th>
              <Th color="neutral.400" borderColor="neutral.700" isNumeric>
                Health
              </Th>
              <Th color="neutral.400" borderColor="neutral.700"></Th>
            </Tr>
          </Thead>
          <Tbody>
            {userPositions.map(position => (
              <Tr key={position.marketId}>
                <Td>
                  <Text textStyle="text-sm-medium" color="white">
                    {position.marketId}
                  </Text>
                </Td>
                <Td isNumeric>
                  <Text textStyle="text-sm-medium" color="white">
                    {formatTVL(position.collateralValueUSD)}
                  </Text>
                </Td>
                <Td isNumeric>
                  <Text textStyle="text-sm-medium" color="white">
                    {formatTVL(position.borrowedValueUSD)}
                  </Text>
                </Td>
                <Td isNumeric>
                  <HStack justify="flex-end" spacing={2}>
                    <Text
                      textStyle="text-sm-medium"
                      color={getHealthFactorColor(position.healthFactor)}
                    >
                      {position.healthFactor.toFixed(2)}
                    </Text>
                    <Badge
                      colorScheme={position.isAtRisk ? 'red' : 'green'}
                      size="sm"
                    >
                      {getHealthFactorLabel(position.healthFactor)}
                    </Badge>
                  </HStack>
                </Td>
                <Td>
                  <Button size="xs" variant="ghost" color="gold.400">
                    Manage
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
}

// ============================================================================
// HOW IT WORKS
// ============================================================================

function HowItWorks() {
  return (
    <Box bg="neutral.900" p={6} borderRadius="lg" border="1px solid" borderColor="neutral.800">
      <Text textStyle="text-lg-medium" color="white" mb={4}>
        How Lending Works
      </Text>
      <Grid templateColumns={['1fr', '1fr', 'repeat(4, 1fr)']} gap={6}>
        <VStack align="start" spacing={2}>
          <Badge colorScheme="yellow" fontSize="sm">
            1
          </Badge>
          <Text textStyle="text-sm-medium" color="white">
            Supply Assets
          </Text>
          <Text textStyle="text-xs-regular" color="neutral.400">
            Deposit stablecoins or other assets to earn yield from borrowers.
          </Text>
        </VStack>
        <VStack align="start" spacing={2}>
          <Badge colorScheme="yellow" fontSize="sm">
            2
          </Badge>
          <Text textStyle="text-sm-medium" color="white">
            Deposit Collateral
          </Text>
          <Text textStyle="text-xs-regular" color="neutral.400">
            Lock LUX, PARS, or LP tokens as collateral to enable borrowing.
          </Text>
        </VStack>
        <VStack align="start" spacing={2}>
          <Badge colorScheme="yellow" fontSize="sm">
            3
          </Badge>
          <Text textStyle="text-sm-medium" color="white">
            Borrow Assets
          </Text>
          <Text textStyle="text-xs-regular" color="neutral.400">
            Borrow up to the max LTV. Monitor your health factor to avoid liquidation.
          </Text>
        </VStack>
        <VStack align="start" spacing={2}>
          <Badge colorScheme="yellow" fontSize="sm">
            4
          </Badge>
          <Text textStyle="text-sm-medium" color="white">
            Repay & Withdraw
          </Text>
          <Text textStyle="text-xs-regular" color="neutral.400">
            Repay debt to unlock collateral. Withdraw anytime with no lockup.
          </Text>
        </VStack>
      </Grid>
    </Box>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export function LendingMarketsPage() {
  return (
    <Flex direction="column" mt="2.5rem">
      {/* Header */}
      <Box mb={6}>
        <HStack spacing={3} mb={2}>
          <Icon as={Bank} color="gold.400" boxSize={8} />
          <Box>
            <HStack spacing={2}>
              <Text textStyle="text-2xl-medium" color="white">
                Lending Markets
              </Text>
              <Text textStyle="text-xl-regular" color="neutral.400" dir="rtl">
                بازار وام
              </Text>
            </HStack>
            <Text textStyle="text-sm-regular" color="neutral.400">
              Supply assets to earn yield, or borrow against your collateral
            </Text>
          </Box>
        </HStack>
      </Box>

      <VStack spacing={6} align="stretch">
        {/* Info Banner */}
        <HStack
          p={4}
          bg="neutral.900"
          borderRadius="lg"
          border="1px solid"
          borderColor="neutral.800"
        >
          <Icon as={Info} color="gold.400" boxSize={5} />
          <Text textStyle="text-sm-regular" color="neutral.300">
            Lending data is loaded from Lux Liquid contracts. Connect your wallet to interact with markets.
            All Shariah-compliant markets use fee-based models (no interest/riba).
          </Text>
        </HStack>

        {/* Stats Overview */}
        <LendingStatsOverview />

        {/* User Positions */}
        <UserPositions />

        {/* Markets Table */}
        <Box>
          <Text textStyle="text-xl-regular" color="white" mb={4}>
            Available Markets
          </Text>
          <MarketsTable />
        </Box>

        {/* How it Works */}
        <HowItWorks />
      </VStack>
    </Flex>
  );
}
