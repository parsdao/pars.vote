import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Icon,
  Text,
  Badge,
  Alert,
  AlertIcon,
  AlertDescription,
  Spinner,
  VStack,
  HStack,
  Divider,
} from '@chakra-ui/react';
import {
  Rocket,
  Lock,
  Plus,
  Handshake,
  Vault,
  ArrowRight,
  Info,
} from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useTokenGate, formatTokenAmount } from '../../hooks/useTokenGate';

function TokenGateOverlay() {
  const { t } = useTranslation('ventures');
  const { isConnected } = useAccount();
  const { balance, requiredBalance, shortfall, isLoading } = useTokenGate();

  if (isLoading) {
    return (
      <Flex
        position="absolute"
        inset={0}
        bg="blackAlpha.800"
        backdropFilter="blur(8px)"
        zIndex={10}
        align="center"
        justify="center"
        borderRadius="lg"
      >
        <Spinner size="xl" color="color-gold-400" />
      </Flex>
    );
  }

  return (
    <Flex
      position="absolute"
      inset={0}
      bg="blackAlpha.800"
      backdropFilter="blur(8px)"
      zIndex={10}
      align="center"
      justify="center"
      borderRadius="lg"
      p={8}
    >
      <VStack spacing={6} maxW="md" textAlign="center">
        <Icon as={Lock} boxSize={16} color="color-gold-400" />
        <Text textStyle="text-2xl-medium" color="white">
          {t('tokenGateTitle', 'Investor Access Required')}
        </Text>
        <Text textStyle="text-md-regular" color="color-neutral-300">
          {t(
            'tokenGateDescription',
            'Access to ventures requires holding at least 1M liquid CYRUS tokens. This ensures aligned incentives between investors and the protocol.',
          )}
        </Text>

        {isConnected ? (
          <Box
            bg="color-neutral-900"
            p={4}
            borderRadius="lg"
            border="1px solid"
            borderColor="color-neutral-700"
            w="full"
          >
            <VStack spacing={2}>
              <HStack justify="space-between" w="full">
                <Text textStyle="text-sm-regular" color="color-neutral-400">
                  Your Balance:
                </Text>
                <Text textStyle="text-sm-medium" color="white">
                  {formatTokenAmount(balance)} CYRUS
                </Text>
              </HStack>
              <HStack justify="space-between" w="full">
                <Text textStyle="text-sm-regular" color="color-neutral-400">
                  Required:
                </Text>
                <Text textStyle="text-sm-medium" color="color-gold-400">
                  {formatTokenAmount(requiredBalance)} CYRUS
                </Text>
              </HStack>
              <Divider borderColor="color-neutral-700" />
              <HStack justify="space-between" w="full">
                <Text textStyle="text-sm-regular" color="color-neutral-400">
                  Need:
                </Text>
                <Text textStyle="text-sm-medium" color="red.400">
                  {formatTokenAmount(shortfall)} CYRUS
                </Text>
              </HStack>
            </VStack>
          </Box>
        ) : (
          <Alert status="warning" borderRadius="lg">
            <AlertIcon />
            <AlertDescription>Connect your wallet to check access</AlertDescription>
          </Alert>
        )}

        <Button
          as="a"
          href="https://cyrus.cash"
          target="_blank"
          size="lg"
          bg="color-gold-400"
          color="color-neutral-950"
          _hover={{ bg: 'color-gold-300' }}
          rightIcon={<Icon as={ArrowRight} />}
        >
          {t('getCyrus', 'Get CYRUS')}
        </Button>
      </VStack>
    </Flex>
  );
}

function InvestmentCTA() {
  const { t } = useTranslation('ventures');

  return (
    <Grid templateColumns={['1fr', '1fr', 'repeat(2, 1fr)']} gap={6} mb={8}>
      {/* Partner with Cyrus Foundation */}
      <GridItem
        as="a"
        href="https://cyrus.foundation"
        target="_blank"
        p={8}
        bg="linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)"
        borderRadius="xl"
        border="2px solid"
        borderColor="color-gold-400"
        cursor="pointer"
        _hover={{
          transform: 'translateY(-4px)',
          boxShadow: '0 20px 40px rgba(212, 175, 55, 0.2)',
        }}
        transition="all 300ms ease-in-out"
      >
        <VStack align="start" spacing={4}>
          <Flex
            align="center"
            justify="center"
            w={16}
            h={16}
            borderRadius="xl"
            bg="color-gold-400"
            color="color-neutral-950"
          >
            <Icon as={Handshake} boxSize={8} />
          </Flex>
          <Text textStyle="text-2xl-medium" color="white">
            {t('partnerTitle', 'Partner with Cyrus Foundation')}
          </Text>
          <Text textStyle="text-md-regular" color="color-neutral-300">
            {t(
              'partnerDescription',
              'Join our network of strategic partners supporting Persian cultural initiatives, humanitarian aid, and community projects worldwide.',
            )}
          </Text>
          <Button
            size="lg"
            variant="outline"
            borderColor="color-gold-400"
            color="color-gold-400"
            _hover={{ bg: 'color-gold-400', color: 'color-neutral-950' }}
            rightIcon={<Icon as={ArrowRight} />}
          >
            {t('becomePartner', 'Become a Partner')}
          </Button>
        </VStack>
      </GridItem>

      {/* Invest via Bonds */}
      <GridItem
        as={Link}
        to="/bonds"
        p={8}
        bg="linear-gradient(135deg, #0f3460 0%, #16213e 100%)"
        borderRadius="xl"
        border="2px solid"
        borderColor="color-gold-400"
        cursor="pointer"
        _hover={{
          transform: 'translateY(-4px)',
          boxShadow: '0 20px 40px rgba(212, 175, 55, 0.2)',
        }}
        transition="all 300ms ease-in-out"
      >
        <VStack align="start" spacing={4}>
          <Flex
            align="center"
            justify="center"
            w={16}
            h={16}
            borderRadius="xl"
            bg="color-gold-400"
            color="color-neutral-950"
          >
            <Icon as={Vault} boxSize={8} />
          </Flex>
          <Text textStyle="text-2xl-medium" color="white">
            {t('investTitle', 'Invest via Protocol Bonds')}
          </Text>
          <Text textStyle="text-md-regular" color="color-neutral-300">
            {t(
              'investDescription',
              'Deposit assets to acquire discounted PARS governance tokens through our OHM-inspired bonding mechanism. Build protocol-owned liquidity.',
            )}
          </Text>
          <Button
            size="lg"
            bg="color-gold-400"
            color="color-neutral-950"
            _hover={{ bg: 'color-gold-300' }}
            rightIcon={<Icon as={ArrowRight} />}
          >
            {t('viewBonds', 'View Available Bonds')}
          </Button>
        </VStack>
      </GridItem>
    </Grid>
  );
}

function EmptyVentures() {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      p={12}
      bg="color-neutral-950"
      borderRadius="lg"
      border="1px dashed"
      borderColor="color-neutral-700"
    >
      <Icon as={Rocket} boxSize={12} color="color-neutral-600" mb={4} />
      <Text textStyle="text-lg-medium" color="color-neutral-400" mb={2}>
        No Active Ventures
      </Text>
      <Text textStyle="text-sm-regular" color="color-neutral-500" textAlign="center" maxW="sm">
        Ventures will appear here once they are created and approved by the DAO.
      </Text>
    </Flex>
  );
}

export function VenturesPage() {
  const { t } = useTranslation('ventures');
  const { hasAccess, isLoading } = useTokenGate();

  return (
    <Flex direction="column" mt="2.5rem" position="relative">
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Text textStyle="text-3xl-medium" color="white">
            {t('pageTitle', 'Venture DAO')}
          </Text>
          <Text textStyle="text-md-regular" color="color-neutral-400" mt={1}>
            {t('pageSubtitle', 'Invest in projects building the future of Persian heritage')}
          </Text>
        </Box>
        {hasAccess && (
          <Button
            leftIcon={<Icon as={Plus} />}
            bg="color-gold-400"
            color="color-neutral-950"
            _hover={{ bg: 'color-gold-300' }}
          >
            {t('createVenture', 'Create Venture')}
          </Button>
        )}
      </Flex>

      {/* Investment CTAs */}
      <InvestmentCTA />

      {/* Ventures Section */}
      <Box position="relative">
        <Flex justify="space-between" align="center" mb={4}>
          <Text textStyle="text-xl-regular" color="white">
            {t('activeVentures', 'Active Ventures')}
          </Text>
          <Badge colorScheme="yellow" fontSize="sm" px={3} py={1}>
            <HStack>
              <Icon as={Lock} />
              <Text>1M+ CYRUS Required</Text>
            </HStack>
          </Badge>
        </Flex>

        {/* Empty state - ventures will be loaded from on-chain */}
        <EmptyVentures />

        {/* Info about on-chain data */}
        <HStack
          mt={4}
          p={3}
          bg="color-neutral-900"
          borderRadius="lg"
          border="1px solid"
          borderColor="color-neutral-800"
        >
          <Icon as={Info} color="color-neutral-400" />
          <Text textStyle="text-xs-regular" color="color-neutral-400">
            Venture data is loaded from on-chain contracts. Connect your wallet and hold 1M+ CYRUS to view and participate.
          </Text>
        </HStack>

        {/* Token Gate Overlay */}
        {!hasAccess && !isLoading && <TokenGateOverlay />}
      </Box>
    </Flex>
  );
}
