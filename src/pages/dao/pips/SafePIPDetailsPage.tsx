import * as amplitude from '@amplitude/analytics-browser';
import { Box } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PIPDetails } from '../../../components/PIPs';
import NoDataCard from '../../../components/ui/containers/NoDataCard';
import { InfoBoxLoader } from '../../../components/ui/loaders/InfoBoxLoader';
import PageHeader from '../../../components/ui/page/Header/PageHeader';
import { DAO_ROUTES } from '../../../constants/routes';
import { usePIP } from '../../../hooks/pips/usePIPs';
import { useCurrentDAOKey } from '../../../hooks/DAO/useCurrentDAOKey';
import { analyticsEvents } from '../../../insights/analyticsEvents';

export function SafePIPDetailsPage() {
  const { t } = useTranslation(['pips', 'navigation', 'breadcrumbs']);
  const { pipId } = useParams<{ pipId: string }>();
  const { pip, loading, error } = usePIP(pipId);
  const { safeAddress, addressPrefix } = useCurrentDAOKey();

  useEffect(() => {
    amplitude.track(analyticsEvents.PIPDetailsPageOpened || 'PIP Details Page Opened', {
      pipId,
    });
  }, [pipId]);

  const pipsListPath = safeAddress
    ? `/pips?dao=${addressPrefix}:${safeAddress}`
    : '/pips';

  return (
    <div>
      <PageHeader
        title={pip ? `PIP-${pip.number}: ${pip.title}` : t('pipDetails')}
        breadcrumbs={
          safeAddress
            ? [
                {
                  terminus: t('proposals', { ns: 'breadcrumbs' }),
                  path: DAO_ROUTES.dao.relative(addressPrefix, safeAddress),
                },
                {
                  terminus: t('pips', { ns: 'breadcrumbs' }),
                  path: pipsListPath,
                },
                {
                  terminus: pip ? `PIP-${pip.number}` : pipId || '',
                  path: '',
                },
              ]
            : [
                {
                  terminus: t('pips', { ns: 'breadcrumbs' }),
                  path: pipsListPath,
                },
                {
                  terminus: pip ? `PIP-${pip.number}` : pipId || '',
                  path: '',
                },
              ]
        }
      />

      {loading ? (
        <Box mt={7}>
          <InfoBoxLoader />
        </Box>
      ) : error || !pip ? (
        <NoDataCard
          emptyText="pipNotFound"
          translationNameSpace="pips"
        />
      ) : (
        <PIPDetails pip={pip} />
      )}
    </div>
  );
}

export default SafePIPDetailsPage;
