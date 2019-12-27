import React, { useState } from 'react';
import { Waypoint } from 'react-waypoint';
import NextLink from 'next/link';
import {
  Grid,
  Box,
  Icon,
  Flex,
  Heading,
  Text,
  Button,
  Link,
} from '@chakra-ui/core';
import Container from '../components/ui/container';
import Card from '../components/ui/card';
// import { Navigation } from 'react-feather';

function Home() {
  const [scrolled, setScrolled] = useState(false);

  const scrolledGridProps = {
    transform: 'scale(0.9)',
    bg: '#fff',
    borderRadius: '2rem',
    boxShadow: '0 12px 48px rgba(0, 0, 0, 0.1)',
  };
  const scrolledIllustrationProps = {
    borderBottomRightRadius: { base: '2rem', md: '2rem' },
    borderBottomLeftRadius: { base: '2rem', md: '0' },
    borderTopRightRadius: { md: '2rem' },
  };

  return (
    <>
      <Waypoint onLeave={() => setScrolled(true)} />
      <Grid
        height="100vh"
        templateColumns={{
          base: 'inherit',
          md: '50% auto',
          lg: '40% auto',
          xl: '30% auto',
        }}
        templateRows={{
          base: 'auto 40%',
          sm: 'auto 50%',
          md: 'inherit',
        }}
        transition="0.3s ease all"
        {...(scrolled && scrolledGridProps)}
      >
        <Flex
          pt={{ base: '2rem', md: '3rem' }}
          pl={{ base: '2rem', md: '3rem' }}
          pr={{ base: '2rem', md: '0' }}
          pb={{ base: '2rem', md: '10rem' }}
          flexDir="column"
          justifyContent={{ md: 'space-between' }}
          bg="red"
        >
          <NextLink href="/">
            <Link display="contents" id="logo">
              <Icon name="logo" size="4rem" />
            </Link>
          </NextLink>
          <Box pr={{ base: '0', md: '3rem' }} mt={{ base: '4rem', md: '0' }}>
            <Heading maxW="280px" lineHeight="1" color="gray.900">
              Uçurtma Projesi Nedir?
            </Heading>
            <Text mt="1.5rem" color="gray.500">
              Başarılı, çalışkan ya da yetenekli öğrencilerin eğitim hayatları
              sırasında hayal ettikleri hedefe ulaşmalarına yardımcı olacak
              maddi desteği güvenli, denetlenebilir ve adil bir şekilde
              sağlayacak bir araçtır.
            </Text>
            <Button
              float="right"
              variant="ghost"
              mt="1rem"
              // rightIcon="arrow-forward"
              color="gray.500"
            >
              Çok Yakında Burada!
            </Button>
          </Box>
          {/* <Flex>
          <Button
            float="right"
            variant="solid"
            mt="1rem"
            bg="white"
            h="66px"
            w="115%"
            flexShrink="0"
            justifyContent="space-between"
            boxShadow="0 0 12px rgba(124, 124, 124, 0.16)"
          >
            Kendin için bir kampanya yarat
            <Icon as={Navigation} size="28px" mr="0.5rem" />
          </Button>
        </Flex> */}
        </Flex>
        <Box
          w="100%"
          bg="red"
          backgroundImage='url("/background.svg")'
          backgroundRepeat="no-repeat"
          backgroundSize="cover"
          backgroundPosition="center center"
          {...(scrolled && scrolledIllustrationProps)}
        />
      </Grid>
      <Container mt="0">
        <Heading color="gray.600" size="lg" mt="4rem" mb="2rem" mx="auto">
          Nasıl Çalışıyor?
        </Heading>
        <Grid
          templateColumns={{
            base: 'inherit',
            md: '50% auto',
            lg: '40% auto',
            xl: 'repeat(3, 1fr)',
          }}
          width="full"
          gap="28px"
        >
          <Card
            px="2rem"
            py="1.5rem"
            borderRadius="2rem"
            boxShadow="0 0 36px rgba(0, 0, 0, 0.1)"
          >
            <Heading color="gray.600" size="md">
              İncele
            </Heading>
            <Text mt="1.5rem" color="gray.500">
              Öğrenci kampanyalarını incele, sana en doğru geleni bul.
            </Text>
          </Card>
          <Card
            px="2rem"
            py="1.5rem"
            borderRadius="2rem"
            boxShadow="0 0 36px rgba(0, 0, 0, 0.1)"
          >
            <Heading color="gray.600" size="md">
              Destek Ol
            </Heading>
            <Text mt="1.5rem" color="gray.500">
              Bağış Yap butonuna tıkla, referans kodunu al. Yönergeleri uygula,
              destek ol.
            </Text>
          </Card>
          <Card
            px="2rem"
            py="1.5rem"
            borderRadius="2rem"
            boxShadow="0 0 36px rgba(0, 0, 0, 0.1)"
          >
            <Heading color="gray.600" size="md">
              Takip Et
            </Heading>
            <Text mt="1.5rem" color="gray.500">
              Destek olduğun öğrencinin gelişimini, başarımını takip et.
            </Text>
          </Card>
        </Grid>
      </Container>
    </>
  );
}

export default Home;
