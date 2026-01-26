import { Box, Flex, Heading, Text, Button, Icon, SimpleGrid } from '@chakra-ui/react';
import { ArrowRight, GlobeHemisphereWest, UsersThree, ShieldCheck, HandFist } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';

interface StatProps {
  value: string;
  label: string;
}

function Stat({ value, label }: StatProps) {
  return (
    <Flex
      direction="column"
      align="center"
      p={4}
      bg="color-neutral-900"
      borderRadius="lg"
    >
      <Text
        fontSize="2xl"
        fontWeight="bold"
        color="color-gold-300"
      >
        {value}
      </Text>
      <Text
        fontSize="sm"
        color="color-neutral-300"
      >
        {label}
      </Text>
    </Flex>
  );
}

export function HeroSection() {
  const { t } = useTranslation('home');

  const stats = [
    { value: t('heroStat1Value'), label: t('heroStat1Label') },
    { value: t('heroStat2Value'), label: t('heroStat2Label') },
    { value: t('heroStat3Value'), label: t('heroStat3Label') },
    { value: t('heroStat4Value'), label: t('heroStat4Label') },
  ];

  const features = [
    { icon: GlobeHemisphereWest, text: t('featureGlobal') },
    { icon: UsersThree, text: t('featureCommunity') },
    { icon: ShieldCheck, text: t('featureTransparent') },
    { icon: HandFist, text: t('featureOnchain') },
  ];

  return (
    <Box
      bg="linear-gradient(180deg, rgba(212, 175, 55, 0.08) 0%, transparent 100%)"
      borderRadius="xl"
      p={{ base: 6, md: 10 }}
      mb={8}
    >
      <Flex
        direction={{ base: 'column', lg: 'row' }}
        gap={10}
        align="center"
      >
        {/* Left content */}
        <Flex
          direction="column"
          flex={1}
          gap={6}
        >
          <Text
            fontSize="xs"
            fontWeight="medium"
            color="color-gold-300"
            textTransform="uppercase"
            letterSpacing="wider"
          >
            {t('heroBadge')}
          </Text>

          <Heading
            as="h1"
            fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}
            fontWeight="bold"
            lineHeight="1.1"
          >
            {t('heroTitle')}
            <Text
              as="span"
              display="block"
              bgGradient="linear(to-r, #D4AF37, #F4D03F)"
              bgClip="text"
            >
              {t('heroTitleHighlight')}
            </Text>
          </Heading>

          <Text
            fontSize="lg"
            color="color-neutral-300"
            maxW="600px"
          >
            {t('heroDescription')}
          </Text>

          <SimpleGrid
            columns={{ base: 2, sm: 4 }}
            gap={3}
            mt={2}
          >
            {features.map((feature, index) => (
              <Flex
                key={index}
                align="center"
                gap={2}
                fontSize="sm"
                color="color-neutral-200"
              >
                <Icon
                  as={feature.icon}
                  boxSize={4}
                  color="color-gold-300"
                />
                <Text>{feature.text}</Text>
              </Flex>
            ))}
          </SimpleGrid>

          <Flex
            gap={4}
            mt={4}
            direction={{ base: 'column', sm: 'row' }}
          >
            <Button
              as="a"
              href="/stake"
              bg="linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)"
              color="black"
              _hover={{
                bg: 'linear-gradient(135deg, #F4D03F 0%, #D4AF37 100%)',
                transform: 'translateY(-2px)',
              }}
              transition="all 0.2s"
              rightIcon={<Icon as={ArrowRight} />}
            >
              {t('heroMintCTA')}
            </Button>
            <Button
              as="a"
              href="https://docs.pars.vote"
              target="_blank"
              rel="noopener noreferrer"
              variant="outline"
              borderColor="color-gold-500"
              color="color-gold-300"
              _hover={{
                bg: 'rgba(212, 175, 55, 0.1)',
              }}
            >
              {t('heroLearnCTA')}
            </Button>
          </Flex>
        </Flex>

        {/* Right stats */}
        <SimpleGrid
          columns={2}
          gap={3}
          minW={{ base: 'full', lg: '280px' }}
        >
          {stats.map((stat, index) => (
            <Stat
              key={index}
              value={stat.value}
              label={stat.label}
            />
          ))}
        </SimpleGrid>
      </Flex>
    </Box>
  );
}
