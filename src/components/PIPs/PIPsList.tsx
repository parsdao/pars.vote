import { Box, Flex, Select, Input, InputGroup, InputLeftElement, Icon as ChakraIcon } from '@chakra-ui/react';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CONTENT_MAXW } from '../../constants/common';
import { PIP, PIPStatus, PIPType, PIP_CATEGORIES } from '../../types/pip';
import NoDataCard from '../ui/containers/NoDataCard';
import { InfoBoxLoader } from '../ui/loaders/InfoBoxLoader';
import { PIPCard } from './PIPCard';

interface PIPsListProps {
  pips: PIP[];
  loading: boolean;
}

export function PIPsList({ pips, loading }: PIPsListProps) {
  const { t } = useTranslation('pips');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PIPStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<PIPType | 'all'>('all');

  const filteredPIPs = useMemo(() => {
    return pips.filter((pip) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          pip.title.toLowerCase().includes(query) ||
          pip.number.includes(query) ||
          pip.summary.toLowerCase().includes(query) ||
          pip.id.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && pip.status !== statusFilter) {
        return false;
      }

      // Type filter
      if (typeFilter !== 'all' && pip.type !== typeFilter) {
        return false;
      }

      return true;
    });
  }, [pips, searchQuery, statusFilter, typeFilter]);

  const statuses: (PIPStatus | 'all')[] = ['all', 'Draft', 'Review', 'Voting', 'Approved', 'Rejected', 'Implemented'];
  const types: (PIPType | 'all')[] = ['all', ...Object.keys(PIP_CATEGORIES) as PIPType[]];

  return (
    <Box maxW={CONTENT_MAXW}>
      {/* Filters */}
      <Flex
        gap={4}
        mb={6}
        flexDirection={{ base: 'column', md: 'row' }}
      >
        <InputGroup flex={1}>
          <InputLeftElement pointerEvents="none">
            <ChakraIcon as={MagnifyingGlass} color="color-neutral-500" />
          </InputLeftElement>
          <Input
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            bg="color-neutral-950"
            borderColor="color-neutral-800"
            _hover={{ borderColor: 'color-neutral-700' }}
            _focus={{ borderColor: 'color-primary-500', boxShadow: 'none' }}
          />
        </InputGroup>

        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as PIPStatus | 'all')}
          bg="color-neutral-950"
          borderColor="color-neutral-800"
          _hover={{ borderColor: 'color-neutral-700' }}
          w={{ base: '100%', md: '200px' }}
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status === 'all' ? t('allStatuses') : status}
            </option>
          ))}
        </Select>

        <Select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as PIPType | 'all')}
          bg="color-neutral-950"
          borderColor="color-neutral-800"
          _hover={{ borderColor: 'color-neutral-700' }}
          w={{ base: '100%', md: '200px' }}
        >
          {types.map((type) => (
            <option key={type} value={type}>
              {type === 'all' ? t('allTypes') : type}
            </option>
          ))}
        </Select>
      </Flex>

      {/* List */}
      <Flex flexDirection="column" gap="1rem">
        {loading ? (
          <Box mt={7}>
            <InfoBoxLoader />
          </Box>
        ) : filteredPIPs.length > 0 ? (
          filteredPIPs.map((pip) => <PIPCard key={pip.id} pip={pip} />)
        ) : pips.length > 0 ? (
          <NoDataCard
            emptyText="noMatchingPIPs"
            translationNameSpace="pips"
          />
        ) : (
          <NoDataCard
            emptyText="noPIPs"
            translationNameSpace="pips"
          />
        )}
      </Flex>
    </Box>
  );
}

export default PIPsList;
