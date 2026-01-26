import * as amplitude from '@amplitude/analytics-browser';
import { Box, Flex, Button, Text } from '@chakra-ui/react';
import { ArrowSquareOut, Plus } from '@phosphor-icons/react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PIPsList } from '../../../components/PIPs';
import PageHeader from '../../../components/ui/page/Header/PageHeader';
import { DAO_ROUTES } from '../../../constants/routes';
import { usePIPs } from '../../../hooks/pips/usePIPs';
import { useCurrentDAOKey } from '../../../hooks/DAO/useCurrentDAOKey';
import { analyticsEvents } from '../../../insights/analyticsEvents';

const PIPS_REPO_URL = 'https://github.com/cyrusdao/pips';

export function SafePIPsPage() {
  const { t } = useTranslation(['pips', 'navigation', 'breadcrumbs']);
  const { pips, loading, error, refetch } = usePIPs();
  const { safeAddress, addressPrefix } = useCurrentDAOKey();

  useEffect(() => {
    amplitude.track(analyticsEvents.PIPsPageOpened || 'PIPs Page Opened');
  }, []);

  return (
    <div>
      <PageHeader
        title={t('pips', { ns: 'navigation' })}
        breadcrumbs={
          safeAddress
            ? [
                {
                  terminus: t('proposals', { ns: 'breadcrumbs' }),
                  path: DAO_ROUTES.dao.relative(addressPrefix, safeAddress),
                },
                {
                  terminus: t('pips', { ns: 'breadcrumbs' }),
                  path: '',
                },
              ]
            : [
                {
                  terminus: t('pips', { ns: 'breadcrumbs' }),
                  path: '',
                },
              ]
        }
      />

      {/* Header Actions */}
      <Flex
        justifyContent="space-between"
        alignItems={{ base: 'flex-start', md: 'center' }}
        flexDirection={{ base: 'column', md: 'row' }}
        gap={4}
        mb={6}
      >
        <Box>
          <Text textStyle="text-base-regular" color="color-neutral-400">
            {t('pipsDescription')}
          </Text>
        </Box>
        <Flex gap={3}>
          <a href={PIPS_REPO_URL} target="_blank" rel="noopener noreferrer">
            <Button
              variant="outline"
              size="sm"
              rightIcon={<ArrowSquareOut />}
            >
              {t('viewRepository')}
            </Button>
          </a>
          <a href={`${PIPS_REPO_URL}#-contributing`} target="_blank" rel="noopener noreferrer">
            <Button
              size="sm"
              leftIcon={<Plus />}
              colorScheme="primary"
            >
              {t('submitPIP')}
            </Button>
          </a>
        </Flex>
      </Flex>

      {/* Error State */}
      {error && (
        <Box
          bg="red.900"
          borderColor="red.500"
          borderWidth={1}
          borderRadius="md"
          p={4}
          mb={6}
        >
          <Text color="red.200">{t('errorLoadingPIPs')}: {error.message}</Text>
          <Button size="sm" mt={2} onClick={refetch}>
            {t('retry')}
          </Button>
        </Box>
      )}

      {/* PIPs List */}
      <PIPsList pips={pips} loading={loading} />
    </div>
  );
}

export default SafePIPsPage;
