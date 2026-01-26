import {
  Box,
  Flex,
  Text,
  Badge,
  Button,
  Link as ChakraLink,
  Divider,
  VStack,
  HStack,
} from '@chakra-ui/react';
import { ArrowSquareOut, ChatCircle, GitBranch, ArrowRight } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { PIP, PIP_STATUS_COLORS } from '../../types/pip';
import { DAO_ROUTES } from '../../constants/routes';
import { useCurrentDAOKey } from '../../hooks/DAO/useCurrentDAOKey';
import { MarkdownViewer } from '../Markdown/MarkdownViewer';
import ContentBox from '../ui/containers/ContentBox';

interface PIPDetailsProps {
  pip: PIP;
}

function PIPStatusBadge({ status }: { status: string }) {
  const colorScheme = PIP_STATUS_COLORS[status as keyof typeof PIP_STATUS_COLORS] || 'gray';

  return (
    <Badge
      colorScheme={colorScheme}
      borderRadius="full"
      px={4}
      py={1.5}
      textTransform="capitalize"
      fontSize="sm"
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
      px={4}
      py={1.5}
      textTransform="capitalize"
      fontSize="sm"
      borderColor="color-neutral-700"
      color="color-neutral-300"
    >
      {type}
    </Badge>
  );
}

export function PIPDetails({ pip }: PIPDetailsProps) {
  const { t } = useTranslation('pips');
  const navigate = useNavigate();
  const { safeAddress, addressPrefix } = useCurrentDAOKey();

  const canCreateProposal = pip.status === 'Review' || pip.status === 'Draft';

  const handleCreateProposal = () => {
    if (safeAddress) {
      // Navigate to proposal creation with PIP reference
      navigate(
        `${DAO_ROUTES.proposalNew.relative(addressPrefix, safeAddress)}&pipRef=${pip.id}`
      );
    }
  };

  return (
    <Box>
      {/* Header Section */}
      <ContentBox mb={6}>
        <Flex
          justifyContent="space-between"
          alignItems={{ base: 'flex-start', md: 'center' }}
          flexDirection={{ base: 'column', md: 'row' }}
          gap={4}
          mb={6}
        >
          <Flex gap={3} alignItems="center" flexWrap="wrap">
            <PIPStatusBadge status={pip.status} />
            <PIPTypeBadge type={pip.type} />
            <Text textStyle="text-sm-regular" color="color-neutral-400">
              Created: {pip.created}
            </Text>
          </Flex>

          <Flex gap={3}>
            {pip.discussionUrl && (
              <ChakraLink href={pip.discussionUrl} isExternal>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<ChatCircle />}
                  rightIcon={<ArrowSquareOut />}
                >
                  {t('discussion')}
                </Button>
              </ChakraLink>
            )}
            <ChakraLink href={pip.repoUrl} isExternal>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<GitBranch />}
                rightIcon={<ArrowSquareOut />}
              >
                {t('viewOnGitHub')}
              </Button>
            </ChakraLink>
          </Flex>
        </Flex>

        {/* PIP Number and Title */}
        <VStack align="stretch" spacing={2}>
          <Text textStyle="text-sm-medium" color="color-neutral-400">
            PIP-{pip.number}
          </Text>
          <Text textStyle="text-2xl-semibold" color="white">
            {pip.title}
          </Text>
        </VStack>
      </ContentBox>

      {/* Action Box - Create Proposal */}
      {safeAddress && canCreateProposal && (
        <ContentBox mb={6} bg="color-neutral-900" borderColor="color-primary-600">
          <Flex
            justifyContent="space-between"
            alignItems={{ base: 'flex-start', md: 'center' }}
            flexDirection={{ base: 'column', md: 'row' }}
            gap={4}
          >
            <VStack align="start" spacing={1}>
              <Text textStyle="text-base-semibold" color="white">
                {t('readyForVote')}
              </Text>
              <Text textStyle="text-sm-regular" color="color-neutral-400">
                {t('readyForVoteDescription')}
              </Text>
            </VStack>
            <Button
              onClick={handleCreateProposal}
              rightIcon={<ArrowRight />}
              colorScheme="primary"
            >
              {t('createProposal')}
            </Button>
          </Flex>
        </ContentBox>
      )}

      {/* Existing On-chain Proposal Link */}
      {pip.onChainProposalId && safeAddress && (
        <ContentBox mb={6} bg="color-neutral-900" borderColor="color-green-600">
          <Flex
            justifyContent="space-between"
            alignItems={{ base: 'flex-start', md: 'center' }}
            flexDirection={{ base: 'column', md: 'row' }}
            gap={4}
          >
            <VStack align="start" spacing={1}>
              <Text textStyle="text-base-semibold" color="white">
                {t('onChainProposalExists')}
              </Text>
              <Text textStyle="text-sm-regular" color="color-neutral-400">
                {t('onChainProposalExistsDescription')}
              </Text>
            </VStack>
            <Link
              to={DAO_ROUTES.proposal.relative(addressPrefix, safeAddress, pip.onChainProposalId)}
            >
              <Button rightIcon={<ArrowRight />} variant="outline">
                {t('viewProposal')}
              </Button>
            </Link>
          </Flex>
        </ContentBox>
      )}

      {/* Content Section */}
      <ContentBox>
        <MarkdownViewer content={pip.content} />
      </ContentBox>

      {/* Metadata Footer */}
      <Box mt={6}>
        <Flex
          justifyContent="space-between"
          alignItems="center"
          color="color-neutral-500"
          textStyle="text-xs-regular"
        >
          <HStack spacing={4}>
            <Text>File: {pip.fileName}</Text>
            <Text>ID: {pip.id}</Text>
          </HStack>
          <ChakraLink href={pip.rawUrl} isExternal color="color-neutral-400">
            Raw Content <ArrowSquareOut style={{ display: 'inline' }} />
          </ChakraLink>
        </Flex>
      </Box>
    </Box>
  );
}

export default PIPDetails;
