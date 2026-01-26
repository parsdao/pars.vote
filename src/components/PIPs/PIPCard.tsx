import { Box, Flex, Text, Badge, Icon as ChakraIcon, Spacer } from '@chakra-ui/react';
import { CalendarBlank, ChatCircle, GitBranch } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PIP, PIP_STATUS_COLORS } from '../../types/pip';
import { DAO_ROUTES } from '../../constants/routes';
import { useCurrentDAOKey } from '../../hooks/DAO/useCurrentDAOKey';

interface PIPCardProps {
  pip: PIP;
}

function PIPStatusBadge({ status }: { status: string }) {
  const colorScheme = PIP_STATUS_COLORS[status as keyof typeof PIP_STATUS_COLORS] || 'gray';

  return (
    <Badge
      colorScheme={colorScheme}
      borderRadius="full"
      px={3}
      py={1}
      textTransform="capitalize"
      fontSize="xs"
    >
      {status}
    </Badge>
  );
}

function PIPTypeBadge({ type }: { type: string }) {
  return (
    <Badge
      variant="outline"
      borderRadius="full"
      px={3}
      py={1}
      textTransform="capitalize"
      fontSize="xs"
      borderColor="color-neutral-700"
      color="color-neutral-300"
    >
      {type}
    </Badge>
  );
}

export function PIPCard({ pip }: PIPCardProps) {
  const { t } = useTranslation('pips');
  const { safeAddress, addressPrefix } = useCurrentDAOKey();

  const pipDetailPath = safeAddress
    ? `/pips/${pip.id}?dao=${addressPrefix}:${safeAddress}`
    : `/pips/${pip.id}`;

  return (
    <Link to={pipDetailPath}>
      <Box
        minHeight="6.25rem"
        bg="color-neutral-950"
        _hover={{ bg: 'color-neutral-900' }}
        _active={{ bg: 'color-neutral-950', border: '1px solid', borderColor: 'color-neutral-900' }}
        transition="all ease-out 300ms"
        p="1.5rem"
        borderRadius="0.75rem"
      >
        {/* Top Row - Status and Type */}
        <Flex
          justifyContent="space-between"
          flexWrap="wrap"
          gap="1rem"
          mb={3}
        >
          <Flex gap={2} alignItems="center">
            <PIPStatusBadge status={pip.status} />
            <PIPTypeBadge type={pip.type} />
          </Flex>
          <Flex gap={4} alignItems="center">
            {pip.discussionUrl && (
              <Flex gap={1} alignItems="center" color="color-neutral-400">
                <ChakraIcon as={ChatCircle} size={16} />
                <Text textStyle="text-xs-medium">{t('discussion')}</Text>
              </Flex>
            )}
          </Flex>
        </Flex>

        {/* Title and Number */}
        <Flex gap={2} alignItems="baseline" mb={2}>
          <Text
            textStyle="text-base-semibold"
            color="color-neutral-100"
          >
            PIP-{pip.number}
          </Text>
          <Text
            textStyle="text-lg-semibold"
            color="white"
          >
            {pip.title}
          </Text>
        </Flex>

        {/* Summary */}
        <Text
          textStyle="text-sm-regular"
          color="color-neutral-400"
          noOfLines={2}
          mb={4}
        >
          {pip.summary || t('noSummary')}
        </Text>

        {/* Footer */}
        <Flex justifyContent="space-between" alignItems="center">
          <Flex gap={2} alignItems="center">
            <ChakraIcon as={GitBranch} color="color-neutral-500" />
            <Text textStyle="text-xs-medium" color="color-neutral-500">
              {pip.id}
            </Text>
          </Flex>
          <Spacer />
          <Flex gap={2} alignItems="center">
            <Text textStyle="text-xs-medium" color="color-neutral-300">
              {pip.created}
            </Text>
            <ChakraIcon as={CalendarBlank} color="color-neutral-500" />
          </Flex>
        </Flex>
      </Box>
    </Link>
  );
}

export default PIPCard;
