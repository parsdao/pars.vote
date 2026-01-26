import {
  Box,
  HStack,
  VStack,
  Text,
  Icon,
  Switch,
  Tooltip,
  Badge,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  Button,
  Divider,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import {
  Shield,
  ShieldCheck,
  Eye,
  EyeSlash,
  Info,
  Lightning,
  Lock,
  Warning,
} from '@phosphor-icons/react';
import { usePrivacyMode } from '../contexts/PrivacyModeContext';
import { PRIVACY_MODES } from '../types/privacy';

interface PrivacyModeToggleProps {
  /** Show expanded info */
  showDetails?: boolean;
  /** Compact mode for header */
  compact?: boolean;
}

export function PrivacyModeToggle({
  showDetails = false,
  compact = false,
}: PrivacyModeToggleProps) {
  const { mode, isProtected, toggleMode, config } = usePrivacyMode();

  const IconComponent = isProtected ? ShieldCheck : Eye;
  const colorScheme = isProtected ? 'green' : 'blue';

  if (compact) {
    return (
      <Popover placement="bottom-end">
        <PopoverTrigger>
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<Icon as={IconComponent} />}
            color={isProtected ? 'green.400' : 'color-neutral-300'}
            _hover={{ bg: 'color-neutral-800' }}
          >
            {config.label}
          </Button>
        </PopoverTrigger>
        <PopoverContent bg="color-neutral-900" borderColor="color-neutral-700" w="300px">
          <PopoverArrow bg="color-neutral-900" />
          <PopoverBody p={4}>
            <PrivacyModeDetails />
          </PopoverBody>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Box
      p={4}
      bg="color-neutral-900"
      borderRadius="lg"
      border="1px solid"
      borderColor={isProtected ? 'green.500' : 'color-neutral-800'}
    >
      <HStack justify="space-between" mb={showDetails ? 3 : 0}>
        <HStack spacing={3}>
          <Icon
            as={IconComponent}
            boxSize={5}
            color={isProtected ? 'green.400' : 'color-neutral-400'}
          />
          <Box>
            <HStack spacing={2}>
              <Text textStyle="text-sm-medium" color="white">
                Privacy Mode
              </Text>
              <Badge colorScheme={colorScheme} fontSize="xs">
                {config.label}
              </Badge>
            </HStack>
            <Text textStyle="text-xs-regular" color="color-neutral-400">
              {config.description}
            </Text>
          </Box>
        </HStack>
        <Switch
          isChecked={isProtected}
          onChange={toggleMode}
          colorScheme="green"
          size="md"
        />
      </HStack>

      {showDetails && <PrivacyModeDetails />}
    </Box>
  );
}

function PrivacyModeDetails() {
  const { mode, isProtected, toggleMode, config } = usePrivacyMode();

  return (
    <VStack align="stretch" spacing={3}>
      <Divider borderColor="color-neutral-700" />

      {/* Mode Toggle */}
      <HStack justify="space-between">
        <HStack spacing={2}>
          <Icon
            as={isProtected ? ShieldCheck : Eye}
            color={isProtected ? 'green.400' : 'blue.400'}
          />
          <Text textStyle="text-sm-medium" color="white">
            {isProtected ? 'Protected Mode' : 'Public Mode'}
          </Text>
        </HStack>
        <Switch
          isChecked={isProtected}
          onChange={toggleMode}
          colorScheme="green"
          size="sm"
        />
      </HStack>

      {/* Features */}
      <Box>
        <Text textStyle="text-xs-medium" color="color-neutral-400" mb={2}>
          Features
        </Text>
        <VStack align="stretch" spacing={1}>
          {config.features.map((feature, i) => (
            <HStack key={i} spacing={2}>
              <Icon
                as={isProtected ? Lock : Lightning}
                boxSize={3}
                color={isProtected ? 'green.400' : 'blue.400'}
              />
              <Text textStyle="text-xs-regular" color="color-neutral-300">
                {feature}
              </Text>
            </HStack>
          ))}
        </VStack>
      </Box>

      {/* Warnings for protected mode */}
      {isProtected && config.warnings && (
        <Alert status="warning" bg="yellow.900" borderRadius="md" py={2}>
          <AlertIcon boxSize={4} />
          <VStack align="start" spacing={0}>
            {config.warnings.map((warning, i) => (
              <Text key={i} textStyle="text-xs-regular" color="yellow.200">
                {warning}
              </Text>
            ))}
          </VStack>
        </Alert>
      )}

      {/* Mode comparison */}
      <Box bg="color-neutral-800" p={3} borderRadius="md">
        <Text textStyle="text-xs-medium" color="color-neutral-400" mb={2}>
          What changes in Protected Mode?
        </Text>
        <VStack align="stretch" spacing={2}>
          <HStack justify="space-between">
            <Text textStyle="text-xs-regular" color="color-neutral-400">
              Gas payment
            </Text>
            <Text textStyle="text-xs-medium" color={isProtected ? 'green.400' : 'white'}>
              {isProtected ? 'Relayed (hidden)' : 'Direct (visible)'}
            </Text>
          </HStack>
          <HStack justify="space-between">
            <Text textStyle="text-xs-regular" color="color-neutral-400">
              Vote privacy
            </Text>
            <Text textStyle="text-xs-medium" color={isProtected ? 'green.400' : 'white'}>
              {isProtected ? 'Encrypted (TFHE)' : 'Public'}
            </Text>
          </HStack>
          <HStack justify="space-between">
            <Text textStyle="text-xs-regular" color="color-neutral-400">
              Identity linkage
            </Text>
            <Text textStyle="text-xs-medium" color={isProtected ? 'green.400' : 'white'}>
              {isProtected ? 'Protected' : 'Visible on-chain'}
            </Text>
          </HStack>
        </VStack>
      </Box>

      {/* Chain info */}
      <Box>
        <Text textStyle="text-xs-medium" color="color-neutral-400" mb={1}>
          Active chains
        </Text>
        <HStack spacing={2}>
          <Badge colorScheme="blue" fontSize="10px">Base (Public)</Badge>
          {isProtected && (
            <>
              <Badge colorScheme="purple" fontSize="10px">Lux t-chain (TFHE)</Badge>
              <Badge colorScheme="green" fontSize="10px">Lux Z-chain (zkvm)</Badge>
            </>
          )}
        </HStack>
      </Box>
    </VStack>
  );
}

/**
 * Compact badge showing current privacy mode
 */
export function PrivacyModeBadge() {
  const { isProtected, config } = usePrivacyMode();

  return (
    <Tooltip label={config.description}>
      <Badge
        colorScheme={isProtected ? 'green' : 'blue'}
        display="flex"
        alignItems="center"
        gap={1}
        px={2}
        py={1}
        borderRadius="full"
      >
        <Icon as={isProtected ? ShieldCheck : Eye} boxSize={3} />
        {config.label}
      </Badge>
    </Tooltip>
  );
}

/**
 * Warning banner shown in protected mode
 */
export function ProtectedModeWarning() {
  const { isProtected } = usePrivacyMode();

  if (!isProtected) return null;

  return (
    <Alert
      status="info"
      bg="green.900"
      borderRadius="md"
      border="1px solid"
      borderColor="green.700"
    >
      <AlertIcon color="green.400" />
      <Box>
        <Text textStyle="text-sm-medium" color="green.200">
          Protected Mode Active
        </Text>
        <Text textStyle="text-xs-regular" color="green.300">
          Transactions are relayed. Votes are encrypted. Identity is protected.
        </Text>
      </Box>
    </Alert>
  );
}
