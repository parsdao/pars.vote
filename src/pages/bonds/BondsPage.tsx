import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Icon,
  Text,
  Badge,
  VStack,
  HStack,
  Input,
  InputGroup,
  InputRightAddon,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Divider,
  Spinner,
} from '@chakra-ui/react';
import {
  Vault,
  Clock,
  ArrowRight,
  Info,
  Lightning,
} from '@phosphor-icons/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

function EmptyBonds() {
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
      <Icon as={Vault} boxSize={12} color="color-neutral-600" mb={4} />
      <Text textStyle="text-lg-medium" color="color-neutral-400" mb={2}>
        No Active Bonds
      </Text>
      <Text textStyle="text-sm-regular" color="color-neutral-500" textAlign="center" maxW="sm">
        Bond offerings will appear here once deployed. Check back soon or join our community for updates.
      </Text>
    </Flex>
  );
}

function BondModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState('');
  const { isConnected } = useAccount();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay bg="blackAlpha.800" backdropFilter="blur(8px)" />
      <ModalContent bg="color-neutral-950" borderColor="color-neutral-800" borderWidth={1}>
        <ModalHeader color="white">
          <HStack>
            <Icon as={Vault} color="color-gold-400" />
            <Text>Bond Assets</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton color="color-neutral-400" />

        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Bond Info */}
            <Box bg="color-neutral-900" p={4} borderRadius="lg">
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <HStack>
                  <Icon as={Clock} color="color-gold-400" />
                  <Box>
                    <Text textStyle="text-xs-regular" color="color-neutral-400">
                      Vesting Period
                    </Text>
                    <Text textStyle="text-md-medium" color="white">
                      Loaded from contract
                    </Text>
                  </Box>
                </HStack>
              </Grid>
            </Box>

            {/* Amount Input */}
            <Box>
              <Text textStyle="text-sm-medium" color="white" mb={2}>
                Deposit Amount
              </Text>
              <InputGroup>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  bg="color-neutral-900"
                  border="1px solid"
                  borderColor="color-neutral-700"
                  _focus={{ borderColor: 'color-gold-400' }}
                  color="white"
                />
                <InputRightAddon bg="color-neutral-800" borderColor="color-neutral-700">
                  TOKEN
                </InputRightAddon>
              </InputGroup>
            </Box>

            <Divider borderColor="color-neutral-800" />

            {/* Info Alert */}
            <HStack
              bg="blue.900"
              p={3}
              borderRadius="lg"
              border="1px solid"
              borderColor="blue.700"
            >
              <Icon as={Info} color="blue.300" />
              <Text textStyle="text-xs-regular" color="blue.200">
                Bonded tokens vest linearly. You can claim vested tokens at any time.
              </Text>
            </HStack>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={4} w="full">
            <Button variant="ghost" onClick={onClose} flex={1}>
              Cancel
            </Button>
            <Button
              bg="color-gold-400"
              color="color-neutral-950"
              _hover={{ bg: 'color-gold-300' }}
              flex={2}
              isDisabled={!isConnected || !amount}
              rightIcon={<Icon as={Lightning} />}
            >
              {isConnected ? 'Approve & Bond' : 'Connect Wallet'}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export function BondsPage() {
  const { t } = useTranslation('bonds');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isConnected } = useAccount();

  // TODO: Load bonds from on-chain contracts
  const isLoading = false;
  const bonds: any[] = []; // Will be populated from contract calls

  return (
    <Flex direction="column" mt="2.5rem">
      {/* Header */}
      <Box mb={8}>
        <HStack mb={2}>
          <Icon as={Vault} boxSize={8} color="color-gold-400" />
          <Text textStyle="text-3xl-medium" color="white">
            {t('pageTitle', 'Protocol Bonds')}
          </Text>
        </HStack>
        <Text textStyle="text-md-regular" color="color-neutral-400" maxW="2xl">
          {t(
            'pageSubtitle',
            'Acquire discounted PARS governance tokens by bonding assets to the protocol. Inspired by OlympusDAO, bonds help build protocol-owned liquidity while rewarding long-term aligned participants.',
          )}
        </Text>
      </Box>

      {/* Info about on-chain data */}
      <HStack
        mb={6}
        p={4}
        bg="color-neutral-900"
        borderRadius="lg"
        border="1px solid"
        borderColor="color-neutral-800"
      >
        <Icon as={Info} color="color-gold-400" boxSize={5} />
        <Text textStyle="text-sm-regular" color="color-neutral-300">
          Bond data, discounts, and capacity are loaded directly from on-chain contracts. Connect your wallet to interact.
        </Text>
      </HStack>

      {/* Bonds Section */}
      <Text textStyle="text-xl-regular" color="white" mb={4}>
        {t('availableBonds', 'Available Bonds')}
      </Text>

      {isLoading ? (
        <Flex justify="center" align="center" p={12}>
          <Spinner size="xl" color="color-gold-400" />
        </Flex>
      ) : bonds.length === 0 ? (
        <EmptyBonds />
      ) : (
        <Grid templateColumns={['1fr', '1fr', 'repeat(2, 1fr)']} gap={4}>
          {/* Bond cards will be rendered here from on-chain data */}
        </Grid>
      )}

      {/* How it works */}
      <Box mt={8} p={6} bg="color-neutral-950" borderRadius="lg" border="1px solid" borderColor="color-neutral-800">
        <Text textStyle="text-lg-medium" color="white" mb={4}>
          How Bonding Works
        </Text>
        <Grid templateColumns={['1fr', '1fr', 'repeat(3, 1fr)']} gap={6}>
          <VStack align="start" spacing={2}>
            <Badge colorScheme="yellow" fontSize="sm">1</Badge>
            <Text textStyle="text-sm-medium" color="white">Deposit Assets</Text>
            <Text textStyle="text-xs-regular" color="color-neutral-400">
              Bond supported assets (ETH, USDC, LP tokens) to the protocol treasury.
            </Text>
          </VStack>
          <VStack align="start" spacing={2}>
            <Badge colorScheme="yellow" fontSize="sm">2</Badge>
            <Text textStyle="text-sm-medium" color="white">Receive Discounted PARS</Text>
            <Text textStyle="text-xs-regular" color="color-neutral-400">
              Get PARS tokens at a discount compared to market price.
            </Text>
          </VStack>
          <VStack align="start" spacing={2}>
            <Badge colorScheme="yellow" fontSize="sm">3</Badge>
            <Text textStyle="text-sm-medium" color="white">Vest & Claim</Text>
            <Text textStyle="text-xs-regular" color="color-neutral-400">
              Tokens vest linearly over the vesting period. Claim anytime.
            </Text>
          </VStack>
        </Grid>
      </Box>

      {/* Bond Modal */}
      <BondModal isOpen={isOpen} onClose={onClose} />
    </Flex>
  );
}
