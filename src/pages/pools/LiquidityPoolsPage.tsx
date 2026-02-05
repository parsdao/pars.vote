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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
} from '@chakra-ui/react';
import {
  Drop,
  ArrowUp,
  ArrowDown,
  Plus,
  Minus,
  Coins,
  ChartLine,
  Lightning,
  CheckCircle,
  Warning,
  Info,
  ArrowsLeftRight,
  Percent,
  Wallet,
} from '@phosphor-icons/react';
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatEther, parseEther, Address } from 'viem';
import { useAccount } from 'wagmi';

import {
  useLiquidityPools,
  useAddLiquidity,
  useRemoveLiquidity,
  usePoolStats,
} from '../../hooks/useLiquidityPools';
import {
  LiquidityPool,
  UserPosition,
  getPoolFeeDisplay,
  getPoolName,
  POOL_CONFIGS,
} from '../../types/liquidityPools';

// ============================================================================
// HELPERS
// ============================================================================

function formatNumber(value: number, decimals = 2): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

function formatPercent(value: number, decimals = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

function formatTokenAmount(value: bigint, decimals = 18): string {
  const num = Number(formatEther(value));
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K`;
  return num.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

// ============================================================================
// COMPONENTS
// ============================================================================

function OverviewStats() {
  const { totalTVL, totalVolume24h, pools } = useLiquidityPools();

  const avgAPY = useMemo(() => {
    if (pools.length === 0) return 0;
    return pools.reduce((sum, p) => sum + p.totalAPY, 0) / pools.length;
  }, [pools]);

  return (
    <Box bg="color-neutral-900" p={6} borderRadius="lg" border="1px solid" borderColor="color-neutral-800">
      <HStack spacing={2} mb={4}>
        <Icon as={Drop} color="color-gold-400" boxSize={5} />
        <Text textStyle="text-lg-medium" color="white">
          Liquidity Pools Overview
        </Text>
        <Badge colorScheme="blue">Lux AMM</Badge>
      </HStack>

      <Grid templateColumns={['1fr', 'repeat(2, 1fr)', 'repeat(4, 1fr)']} gap={4}>
        <Stat>
          <StatLabel color="color-neutral-400">Total Value Locked</StatLabel>
          <StatNumber color="white">{formatNumber(totalTVL)}</StatNumber>
          <StatHelpText color="green.400">
            <StatArrow type="increase" />
            12.3% (7d)
          </StatHelpText>
        </Stat>

        <Stat>
          <StatLabel color="color-neutral-400">24h Volume</StatLabel>
          <StatNumber color="white">{formatNumber(totalVolume24h)}</StatNumber>
          <StatHelpText color="green.400">
            <StatArrow type="increase" />
            8.5% vs yesterday
          </StatHelpText>
        </Stat>

        <Stat>
          <StatLabel color="color-neutral-400">Active Pools</StatLabel>
          <StatNumber color="white">{pools.length}</StatNumber>
          <StatHelpText color="color-neutral-500">Concentrated liquidity</StatHelpText>
        </Stat>

        <Stat>
          <StatLabel color="color-neutral-400">Avg APY</StatLabel>
          <StatNumber color="color-gold-400">{formatPercent(avgAPY)}</StatNumber>
          <StatHelpText color="color-neutral-500">Fees + rewards</StatHelpText>
        </Stat>
      </Grid>
    </Box>
  );
}

function PoolCard({ pool, onSelect }: { pool: LiquidityPool; onSelect: () => void }) {
  return (
    <Box
      bg="color-neutral-900"
      p={4}
      borderRadius="lg"
      border="1px solid"
      borderColor="color-neutral-800"
      cursor="pointer"
      _hover={{ borderColor: 'color-gold-400', transform: 'translateY(-2px)' }}
      transition="all 200ms"
      onClick={onSelect}
    >
      {/* Pool Header */}
      <HStack justify="space-between" mb={3}>
        <HStack spacing={2}>
          <HStack spacing={-2}>
            {pool.token0.logoURI && (
              <Box
                w={6}
                h={6}
                borderRadius="full"
                bg="color-neutral-700"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <img src={pool.token0.logoURI} alt={pool.token0.symbol} width={20} height={20} />
              </Box>
            )}
            {pool.token1.logoURI && (
              <Box
                w={6}
                h={6}
                borderRadius="full"
                bg="color-neutral-700"
                display="flex"
                alignItems="center"
                justifyContent="center"
                ml={-2}
              >
                <img src={pool.token1.logoURI} alt={pool.token1.symbol} width={20} height={20} />
              </Box>
            )}
          </HStack>
          <VStack align="start" spacing={0}>
            <Text textStyle="text-md-medium" color="white">
              {getPoolName(pool)}
            </Text>
            <Badge colorScheme="gray" fontSize="10px">
              {getPoolFeeDisplay(pool.fee)}
            </Badge>
          </VStack>
        </HStack>
        <Badge colorScheme="green">Active</Badge>
      </HStack>

      {/* Pool Stats */}
      <Grid templateColumns="repeat(2, 1fr)" gap={3}>
        <Box>
          <Text textStyle="text-xs-regular" color="color-neutral-400">
            TVL
          </Text>
          <Text textStyle="text-md-medium" color="white">
            {formatNumber(pool.tvlUSD)}
          </Text>
        </Box>
        <Box>
          <Text textStyle="text-xs-regular" color="color-neutral-400">
            24h Volume
          </Text>
          <Text textStyle="text-md-medium" color="white">
            {formatNumber(pool.volume24h)}
          </Text>
        </Box>
        <Box>
          <Text textStyle="text-xs-regular" color="color-neutral-400">
            Fee APY
          </Text>
          <Text textStyle="text-md-medium" color="green.400">
            {formatPercent(pool.feeAPY)}
          </Text>
        </Box>
        <Box>
          <Text textStyle="text-xs-regular" color="color-neutral-400">
            Total APY
          </Text>
          <Text textStyle="text-md-medium" color="color-gold-400">
            {formatPercent(pool.totalAPY)}
          </Text>
        </Box>
      </Grid>

      {/* APY Breakdown */}
      {pool.rewardsAPY > 0 && (
        <Box mt={3}>
          <Flex h={1} borderRadius="full" overflow="hidden" bg="color-neutral-800">
            <Tooltip label={`Fee APY: ${formatPercent(pool.feeAPY)}`}>
              <Box
                h="full"
                w={`${(pool.feeAPY / pool.totalAPY) * 100}%`}
                bg="green.500"
              />
            </Tooltip>
            <Tooltip label={`Rewards APY: ${formatPercent(pool.rewardsAPY)}`}>
              <Box
                h="full"
                w={`${(pool.rewardsAPY / pool.totalAPY) * 100}%`}
                bg="color-gold-400"
              />
            </Tooltip>
          </Flex>
          <HStack spacing={3} mt={1}>
            <HStack spacing={1}>
              <Box w={2} h={2} borderRadius="full" bg="green.500" />
              <Text textStyle="text-xs-regular" color="color-neutral-500">
                Fees
              </Text>
            </HStack>
            <HStack spacing={1}>
              <Box w={2} h={2} borderRadius="full" bg="color-gold-400" />
              <Text textStyle="text-xs-regular" color="color-neutral-500">
                PARS Rewards
              </Text>
            </HStack>
          </HStack>
        </Box>
      )}
    </Box>
  );
}

function PoolsGrid() {
  const { pools, selectPool } = useLiquidityPools();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedPool, setSelectedPool] = useState<LiquidityPool | null>(null);

  const handleSelectPool = (pool: LiquidityPool) => {
    setSelectedPool(pool);
    selectPool(pool.address);
    onOpen();
  };

  return (
    <>
      <Box bg="color-neutral-900" p={6} borderRadius="lg" border="1px solid" borderColor="color-neutral-800">
        <HStack justify="space-between" mb={4}>
          <HStack spacing={2}>
            <Icon as={Coins} color="color-gold-400" boxSize={5} />
            <Text textStyle="text-lg-medium" color="white">
              Available Pools
            </Text>
          </HStack>
          <HStack spacing={2}>
            <Select
              size="sm"
              w="120px"
              bg="color-neutral-800"
              border="none"
              defaultValue="tvl"
            >
              <option value="tvl">Sort: TVL</option>
              <option value="apy">Sort: APY</option>
              <option value="volume">Sort: Volume</option>
            </Select>
          </HStack>
        </HStack>

        <Grid templateColumns={['1fr', 'repeat(2, 1fr)', 'repeat(3, 1fr)']} gap={4}>
          {pools.map((pool) => (
            <PoolCard
              key={pool.address}
              pool={pool}
              onSelect={() => handleSelectPool(pool)}
            />
          ))}
        </Grid>
      </Box>

      {/* Pool Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent bg="color-neutral-900" borderColor="color-neutral-700">
          <ModalHeader color="white">
            {selectedPool && getPoolName(selectedPool)}
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody>
            {selectedPool && <PoolDetailsContent pool={selectedPool} />}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="yellow" mr={3}>
              Add Liquidity
            </Button>
            <Button variant="outline" colorScheme="gray" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

function PoolDetailsContent({ pool }: { pool: LiquidityPool }) {
  const stats = usePoolStats(pool.address);

  return (
    <VStack spacing={4} align="stretch">
      {/* Token Info */}
      <Grid templateColumns="repeat(2, 1fr)" gap={4}>
        <Box bg="color-neutral-800" p={3} borderRadius="md">
          <HStack spacing={2} mb={2}>
            {pool.token0.logoURI && (
              <img src={pool.token0.logoURI} alt={pool.token0.symbol} width={24} height={24} />
            )}
            <Text textStyle="text-sm-medium" color="white">
              {pool.token0.symbol}
            </Text>
          </HStack>
          <Text textStyle="text-xs-regular" color="color-neutral-400" noOfLines={1}>
            {pool.token0.address}
          </Text>
        </Box>
        <Box bg="color-neutral-800" p={3} borderRadius="md">
          <HStack spacing={2} mb={2}>
            {pool.token1.logoURI && (
              <img src={pool.token1.logoURI} alt={pool.token1.symbol} width={24} height={24} />
            )}
            <Text textStyle="text-sm-medium" color="white">
              {pool.token1.symbol}
            </Text>
          </HStack>
          <Text textStyle="text-xs-regular" color="color-neutral-400" noOfLines={1}>
            {pool.token1.address}
          </Text>
        </Box>
      </Grid>

      {/* Statistics */}
      <Box bg="color-neutral-800" p={4} borderRadius="md">
        <Text textStyle="text-sm-medium" color="white" mb={3}>
          Pool Statistics
        </Text>
        <Grid templateColumns="repeat(3, 1fr)" gap={3}>
          <Box>
            <Text textStyle="text-xs-regular" color="color-neutral-400">
              TVL
            </Text>
            <Text textStyle="text-md-medium" color="white">
              {formatNumber(pool.tvlUSD)}
            </Text>
          </Box>
          <Box>
            <Text textStyle="text-xs-regular" color="color-neutral-400">
              24h Volume
            </Text>
            <Text textStyle="text-md-medium" color="white">
              {formatNumber(pool.volume24h)}
            </Text>
          </Box>
          <Box>
            <Text textStyle="text-xs-regular" color="color-neutral-400">
              24h Fees
            </Text>
            <Text textStyle="text-md-medium" color="green.400">
              {stats ? formatNumber(stats.fees24h) : '-'}
            </Text>
          </Box>
          <Box>
            <Text textStyle="text-xs-regular" color="color-neutral-400">
              Fee Tier
            </Text>
            <Text textStyle="text-md-medium" color="white">
              {getPoolFeeDisplay(pool.fee)}
            </Text>
          </Box>
          <Box>
            <Text textStyle="text-xs-regular" color="color-neutral-400">
              Fee APY
            </Text>
            <Text textStyle="text-md-medium" color="green.400">
              {formatPercent(pool.feeAPY)}
            </Text>
          </Box>
          <Box>
            <Text textStyle="text-xs-regular" color="color-neutral-400">
              Total APY
            </Text>
            <Text textStyle="text-md-medium" color="color-gold-400">
              {formatPercent(pool.totalAPY)}
            </Text>
          </Box>
        </Grid>
      </Box>

      {/* Protocol Info */}
      <Alert status="info" bg="color-neutral-800" borderRadius="md">
        <AlertIcon color="blue.400" />
        <Box>
          <Text textStyle="text-sm-medium" color="white">
            Concentrated Liquidity
          </Text>
          <Text textStyle="text-xs-regular" color="color-neutral-400">
            Lux AMM uses Uniswap V3-style concentrated liquidity for capital efficiency.
            Choose your price range to maximize yields.
          </Text>
        </Box>
      </Alert>
    </VStack>
  );
}

function UserPositionsCard() {
  const { isConnected } = useAccount();
  const { positions, userTotalValue, userTotalFees } = useLiquidityPools();
  const { collectFees, isPending } = useRemoveLiquidity();

  if (!isConnected) {
    return (
      <Box bg="color-neutral-900" p={6} borderRadius="lg" border="1px solid" borderColor="color-neutral-800">
        <VStack spacing={4}>
          <Icon as={Wallet} color="color-neutral-500" boxSize={10} />
          <Text color="color-neutral-400">Connect wallet to view your positions</Text>
        </VStack>
      </Box>
    );
  }

  if (positions.length === 0) {
    return (
      <Box bg="color-neutral-900" p={6} borderRadius="lg" border="1px solid" borderColor="color-neutral-800">
        <VStack spacing={4}>
          <Icon as={Drop} color="color-neutral-500" boxSize={10} />
          <Text color="color-neutral-400">No liquidity positions found</Text>
          <Text textStyle="text-xs-regular" color="color-neutral-500">
            Add liquidity to a pool to start earning fees
          </Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box bg="color-neutral-900" p={6} borderRadius="lg" border="1px solid" borderColor="color-neutral-800">
      <HStack justify="space-between" mb={4}>
        <HStack spacing={2}>
          <Icon as={Lightning} color="color-gold-400" boxSize={5} />
          <Text textStyle="text-lg-medium" color="white">
            Your Positions
          </Text>
        </HStack>
        <HStack spacing={4}>
          <Box>
            <Text textStyle="text-xs-regular" color="color-neutral-400">
              Total Value
            </Text>
            <Text textStyle="text-md-medium" color="white">
              {formatNumber(userTotalValue)}
            </Text>
          </Box>
          <Box>
            <Text textStyle="text-xs-regular" color="color-neutral-400">
              Uncollected Fees
            </Text>
            <Text textStyle="text-md-medium" color="green.400">
              {formatNumber(userTotalFees)}
            </Text>
          </Box>
        </HStack>
      </HStack>

      <VStack spacing={3} align="stretch">
        {positions.map((position) => (
          <PositionRow
            key={position.tokenId.toString()}
            position={position}
            onCollectFees={() => collectFees(position.tokenId)}
            isCollecting={isPending}
          />
        ))}
      </VStack>
    </Box>
  );
}

function PositionRow({
  position,
  onCollectFees,
  isCollecting,
}: {
  position: UserPosition;
  onCollectFees: () => void;
  isCollecting: boolean;
}) {
  const { pools } = useLiquidityPools();
  const pool = pools.find((p) => p.address === position.poolAddress);

  if (!pool) return null;

  return (
    <Box
      p={4}
      bg="color-neutral-800"
      borderRadius="md"
      border="1px solid"
      borderColor={position.inRange ? 'green.500' : 'yellow.500'}
    >
      <HStack justify="space-between" mb={3}>
        <HStack spacing={2}>
          <Text textStyle="text-sm-medium" color="white">
            {getPoolName(pool)}
          </Text>
          <Badge colorScheme={position.inRange ? 'green' : 'yellow'}>
            {position.inRange ? 'In Range' : 'Out of Range'}
          </Badge>
          <Badge colorScheme="gray" fontSize="10px">
            #{position.tokenId.toString()}
          </Badge>
        </HStack>
        <Text textStyle="text-md-medium" color="white">
          {formatNumber(position.valueUSD)}
        </Text>
      </HStack>

      <Grid templateColumns="repeat(4, 1fr)" gap={3} mb={3}>
        <Box>
          <Text textStyle="text-xs-regular" color="color-neutral-400">
            {pool.token0.symbol}
          </Text>
          <Text textStyle="text-sm-medium" color="white">
            {formatTokenAmount(position.amount0)}
          </Text>
        </Box>
        <Box>
          <Text textStyle="text-xs-regular" color="color-neutral-400">
            {pool.token1.symbol}
          </Text>
          <Text textStyle="text-sm-medium" color="white">
            {formatTokenAmount(position.amount1)}
          </Text>
        </Box>
        <Box>
          <Text textStyle="text-xs-regular" color="color-neutral-400">
            Fees ({pool.token0.symbol})
          </Text>
          <Text textStyle="text-sm-medium" color="green.400">
            {formatTokenAmount(position.fees0)}
          </Text>
        </Box>
        <Box>
          <Text textStyle="text-xs-regular" color="color-neutral-400">
            Fees ({pool.token1.symbol})
          </Text>
          <Text textStyle="text-sm-medium" color="green.400">
            {formatTokenAmount(position.fees1)}
          </Text>
        </Box>
      </Grid>

      <HStack spacing={2}>
        <Button
          size="sm"
          colorScheme="green"
          variant="outline"
          leftIcon={<Icon as={Coins} />}
          onClick={onCollectFees}
          isLoading={isCollecting}
          isDisabled={position.fees0 === 0n && position.fees1 === 0n}
        >
          Collect Fees
        </Button>
        <Button size="sm" colorScheme="yellow" variant="outline" leftIcon={<Icon as={Plus} />}>
          Add Liquidity
        </Button>
        <Button size="sm" colorScheme="red" variant="outline" leftIcon={<Icon as={Minus} />}>
          Remove
        </Button>
      </HStack>
    </Box>
  );
}

function AddLiquidityCard() {
  const { isConnected } = useAccount();
  const { pools } = useLiquidityPools();
  const { addLiquidity, isPending, error } = useAddLiquidity();
  const [selectedPoolAddress, setSelectedPoolAddress] = useState<Address | ''>('');
  const [amount0, setAmount0] = useState('');
  const [amount1, setAmount1] = useState('');
  const [priceRangeType, setPriceRangeType] = useState<'full' | 'concentrated'>('full');

  const selectedPool = pools.find((p) => p.address === selectedPoolAddress);

  if (!isConnected) {
    return (
      <Box bg="color-neutral-900" p={6} borderRadius="lg" border="1px solid" borderColor="color-neutral-800">
        <VStack spacing={4}>
          <Icon as={Plus} color="color-neutral-500" boxSize={10} />
          <Text color="color-neutral-400">Connect wallet to add liquidity</Text>
        </VStack>
      </Box>
    );
  }

  const handleAddLiquidity = async () => {
    if (!selectedPool || !amount0 || !amount1) return;

    const deadline = BigInt(Math.floor(Date.now() / 1000) + 1800);
    const tickSpacing = selectedPool.fee === 500 ? 10 : selectedPool.fee === 3000 ? 60 : 200;

    try {
      await addLiquidity({
        poolAddress: selectedPool.address,
        token0: selectedPool.token0.address,
        token1: selectedPool.token1.address,
        fee: selectedPool.fee,
        tickLower: priceRangeType === 'full' ? -887220 : -tickSpacing * 100,
        tickUpper: priceRangeType === 'full' ? 887220 : tickSpacing * 100,
        amount0Desired: parseEther(amount0),
        amount1Desired: parseEther(amount1),
        amount0Min: 0n,
        amount1Min: 0n,
        deadline,
      });
      setAmount0('');
      setAmount1('');
    } catch (e) {
      console.error('Add liquidity failed:', e);
    }
  };

  return (
    <Box bg="color-neutral-900" p={6} borderRadius="lg" border="1px solid" borderColor="color-neutral-800">
      <HStack spacing={2} mb={4}>
        <Icon as={Plus} color="color-gold-400" boxSize={5} />
        <Text textStyle="text-lg-medium" color="white">
          Add Liquidity
        </Text>
      </HStack>

      <VStack spacing={4} align="stretch">
        {/* Pool Selection */}
        <Box>
          <Text textStyle="text-sm-medium" color="white" mb={2}>
            Select Pool
          </Text>
          <Select
            placeholder="Choose a pool"
            value={selectedPoolAddress}
            onChange={(e) => setSelectedPoolAddress(e.target.value as Address)}
            bg="color-neutral-800"
            border="none"
          >
            {pools.map((pool) => (
              <option key={pool.address} value={pool.address}>
                {getPoolName(pool)} ({getPoolFeeDisplay(pool.fee)}) - APY: {formatPercent(pool.totalAPY)}
              </option>
            ))}
          </Select>
        </Box>

        {selectedPool && (
          <>
            {/* Price Range */}
            <Box>
              <Text textStyle="text-sm-medium" color="white" mb={2}>
                Price Range
              </Text>
              <HStack spacing={2}>
                <Button
                  size="sm"
                  colorScheme={priceRangeType === 'full' ? 'yellow' : 'gray'}
                  variant={priceRangeType === 'full' ? 'solid' : 'outline'}
                  onClick={() => setPriceRangeType('full')}
                >
                  Full Range
                </Button>
                <Button
                  size="sm"
                  colorScheme={priceRangeType === 'concentrated' ? 'yellow' : 'gray'}
                  variant={priceRangeType === 'concentrated' ? 'solid' : 'outline'}
                  onClick={() => setPriceRangeType('concentrated')}
                >
                  Concentrated
                </Button>
              </HStack>
              <Text textStyle="text-xs-regular" color="color-neutral-500" mt={1}>
                {priceRangeType === 'full'
                  ? 'Provide liquidity across entire price range (like Uniswap V2)'
                  : 'Concentrate liquidity around current price for higher APY'}
              </Text>
            </Box>

            {/* Token Amounts */}
            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <Box>
                <Text textStyle="text-sm-medium" color="white" mb={2}>
                  {selectedPool.token0.symbol}
                </Text>
                <InputGroup>
                  <Input
                    placeholder="0.0"
                    value={amount0}
                    onChange={(e) => setAmount0(e.target.value)}
                    type="number"
                    bg="color-neutral-800"
                    border="none"
                  />
                  <InputRightAddon bg="color-neutral-700" border="none">
                    {selectedPool.token0.symbol}
                  </InputRightAddon>
                </InputGroup>
              </Box>
              <Box>
                <Text textStyle="text-sm-medium" color="white" mb={2}>
                  {selectedPool.token1.symbol}
                </Text>
                <InputGroup>
                  <Input
                    placeholder="0.0"
                    value={amount1}
                    onChange={(e) => setAmount1(e.target.value)}
                    type="number"
                    bg="color-neutral-800"
                    border="none"
                  />
                  <InputRightAddon bg="color-neutral-700" border="none">
                    {selectedPool.token1.symbol}
                  </InputRightAddon>
                </InputGroup>
              </Box>
            </Grid>

            {/* Expected Returns */}
            <Box bg="color-neutral-800" p={3} borderRadius="md">
              <HStack justify="space-between">
                <Text textStyle="text-sm-regular" color="color-neutral-400">
                  Expected APY
                </Text>
                <Text textStyle="text-sm-medium" color="color-gold-400">
                  {formatPercent(selectedPool.totalAPY)}
                </Text>
              </HStack>
              {priceRangeType === 'concentrated' && (
                <Text textStyle="text-xs-regular" color="color-neutral-500" mt={1}>
                  Concentrated positions can earn 2-4x higher APY when in range
                </Text>
              )}
            </Box>

            {/* Add Button */}
            <Button
              w="full"
              colorScheme="yellow"
              size="lg"
              leftIcon={<Icon as={Plus} />}
              onClick={handleAddLiquidity}
              isLoading={isPending}
              isDisabled={!amount0 || !amount1}
            >
              Add Liquidity
            </Button>

            {error && (
              <Alert status="error" bg="red.900" borderRadius="md">
                <AlertIcon />
                <Text textStyle="text-sm-regular">{error.message}</Text>
              </Alert>
            )}
          </>
        )}
      </VStack>
    </Box>
  );
}

function PoolInfoCard() {
  return (
    <Box bg="color-neutral-900" p={6} borderRadius="lg" border="1px solid" borderColor="color-neutral-800">
      <HStack spacing={2} mb={4}>
        <Icon as={Info} color="color-gold-400" boxSize={5} />
        <Text textStyle="text-lg-medium" color="white">
          About Lux AMM Pools
        </Text>
      </HStack>

      <VStack spacing={3} align="stretch">
        <HStack spacing={2}>
          <Icon as={CheckCircle} color="green.400" boxSize={4} />
          <Text textStyle="text-sm-regular" color="color-neutral-300">
            Concentrated liquidity for capital efficiency
          </Text>
        </HStack>
        <HStack spacing={2}>
          <Icon as={CheckCircle} color="green.400" boxSize={4} />
          <Text textStyle="text-sm-regular" color="color-neutral-300">
            Multiple fee tiers (0.05%, 0.30%, 1.00%)
          </Text>
        </HStack>
        <HStack spacing={2}>
          <Icon as={CheckCircle} color="green.400" boxSize={4} />
          <Text textStyle="text-sm-regular" color="color-neutral-300">
            NFT positions for flexible management
          </Text>
        </HStack>
        <HStack spacing={2}>
          <Icon as={CheckCircle} color="green.400" boxSize={4} />
          <Text textStyle="text-sm-regular" color="color-neutral-300">
            PARS rewards on top of trading fees
          </Text>
        </HStack>
      </VStack>

      <Divider borderColor="color-neutral-700" my={4} />

      <Alert status="warning" bg="color-neutral-800" borderRadius="md">
        <AlertIcon color="yellow.400" />
        <Box>
          <Text textStyle="text-sm-medium" color="white">
            Impermanent Loss Risk
          </Text>
          <Text textStyle="text-xs-regular" color="color-neutral-400">
            Providing liquidity involves risk. Concentrated positions amplify both gains and losses.
          </Text>
        </Box>
      </Alert>
    </Box>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export function LiquidityPoolsPage() {
  const { t } = useTranslation('common');

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <HStack spacing={3} mb={2}>
            <Icon as={Drop} color="color-gold-400" boxSize={8} />
            <Box>
              <HStack spacing={2}>
                <Text textStyle="text-2xl-medium" color="white">
                  Liquidity Pools
                </Text>
                <Text textStyle="text-xl-regular" color="color-neutral-400" dir="rtl">
                  استخرهای نقدینگی
                </Text>
              </HStack>
              <Text textStyle="text-sm-regular" color="color-neutral-400">
                Provide liquidity to earn trading fees and PARS rewards
              </Text>
            </Box>
          </HStack>
        </Box>

        {/* Overview Stats */}
        <OverviewStats />

        {/* User Positions */}
        <UserPositionsCard />

        {/* Main Content */}
        <Grid templateColumns={['1fr', '1fr', '2fr 1fr']} gap={6}>
          {/* Pools List */}
          <PoolsGrid />

          {/* Sidebar */}
          <VStack spacing={6} align="stretch">
            <AddLiquidityCard />
            <PoolInfoCard />
          </VStack>
        </Grid>
      </VStack>
    </Container>
  );
}
