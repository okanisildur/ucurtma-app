import React, { useContext } from 'react';
import { Formik, Form, FieldArray } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import EasyMDE from 'easymde';
import {
  Flex,
  Button,
  FormLabel,
  Image,
  Box,
  Heading,
  RadioButtonGroup,
} from '@chakra-ui/core';
import { PlusCircle, Trash2, ChevronDown, ChevronUp } from 'react-feather';
import Input from '../../ui/input';
import NumberInput from '../../ui/numeric-input';
import config from '../../../config';
import useImperativeQuery from '../../../utils/use-imperative-query';
import { GET_CAMPAIGN_EXISTENCE } from '../../../graphql/queries';
import { MainContext } from '../../../context/main-context';
import CustomRadio from '../../custom-radio';

const markdownPlaceholder = `## Merhaba

Editörümüz markdown ile çalışmaktadır. Markdown ile şekillendirmenin nasıl yapıldığını bilmiyorsanız sağ üstteki soru işareti butonuna tıklayarak öğrenebilirsiniz.

#### İçerik, sayfamda nasıl gözükecek?

Eğer içeriğinizin sayfanızda nasıl gözükeceğini merak ediyorsanız yine yukarıda bulunan butonlardan göz butonuna tıklayabilirsiniz.
`;

const deployContractSchema = (t, campaignExist) => {
  const { web3 } = window;
  return Yup.object().shape({
    campaignId: Yup.string()
      .required(t('validations.required'))
      .min(5, t('validations.idLimit'))
      .test('Campaign ID', t('validations.idExist'), () => !campaignExist),
    numberOfPlannedPayouts: Yup.string().required(t('validations.required')),
    withdrawPeriod: Yup.string().required(t('validations.required')),
    campaignTitle: Yup.string().required(t('validations.required')),
    campaignEndTime: Yup.string().required(t('validations.required')),
    owner: Yup.string().test(
      'Check Address',
      t('validations.incorrectAddress'),
      value => (value ? web3.utils.isAddress(value) : true)
    ),
    student: Yup.object().shape({
      name: Yup.string().required(t('validations.required')),
      school: Yup.string().required(t('validations.required')),
      department: Yup.string().required(t('validations.required')),
      profilePhoto: Yup.string().url(t('validations.link')),
    }),
    goals: Yup.array().of(
      Yup.object().shape({
        description: Yup.string().required(t('validations.required')), // these constraints take precedence
      })
    ),
    documents: Yup.array().of(
      Yup.object().shape({
        title: Yup.string().required(t('validations.required')), // these constraints take precedence
        link: Yup.string()
          .url(t('validations.link'))
          .required(t('validations.required')), // these constraints take precedence
      })
    ),
    tokenAddress: Yup.string().required(t('validations.required')),
  });
};

function CreateCampaignForm({
  onSubmit,
  loading,
  initialValues,
  onActivate,
  activateStatus,
  isEdit,
}) {
  const [campaignExist, setCampaignExist] = React.useState(false);
  const { state: mainState } = useContext(MainContext);
  const [showOwnerWallet, setShowOwnerWallet] = React.useState(true);
  const editorRef = React.useRef(null);
  const { t } = useTranslation('createCampaign');
  const getCampaign = useImperativeQuery(GET_CAMPAIGN_EXISTENCE);
  const isWalletExist = mainState.wallet;

  React.useEffect(() => {
    return () => {
      window.editor = undefined;
    };
  }, []);

  React.useEffect(() => {
    if (editorRef.current && !window.editor) {
      window.editor = new EasyMDE({
        element: editorRef.current,
        autoDownloadFontAwesome: undefined, // change with our icon package, react-feather.
        spellChecker: false,
        nativeSpellcheck: false,
        status: false,
        initialValue: markdownPlaceholder,
        promptURLs: true,
        promptTexts: {
          image: "Resim URL'ini giriniz:",
          link: "Eklemek istediğiniz linkin URL'ini giriniz:",
        },
      });
    }

    if (!mainState.wallet && window.editor) {
      window.editor.codemirror.setOption('readOnly', true);
    } else {
      window.editor.codemirror.setOption('readOnly', false);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainState]);

  React.useEffect(() => {
    if (initialValues) {
      if (initialValues.campaignText) {
        window.editor.value(initialValues.campaignText);
      }
    }

    return () => {
      if (window.editor) window.editor.value(markdownPlaceholder);
    };
  }, [initialValues]);

  const checkCampaignId = async campaignId => {
    const { data, error } = await getCampaign({ campaignId });
    if (error?.data?.campaign || data?.campaign) {
      setCampaignExist(true);
      return true;
    }
    setCampaignExist(false);
    return false;
  };

  return (
    <Formik
      initialValues={{
        numberOfPlannedPayouts: initialValues?.numberOfPlannedPayouts || 48, // how much donation can be taken from this contract
        withdrawPeriod: initialValues?.withdrawPeriod || 28, // donation per second. 28 days
        campaignEndTime: initialValues?.campaignEndTime || 30, // when will campaign end after started in seconds?
        owner: initialValues?.owner || '', // the ethereum address of student
        tokenAddress: config.ethereum.biliraTokenAddress, // the ethereum address of biLira,
        adminAddress: mainState.wallet, // the ethereum address of user who make action with metamask
        campaignId: initialValues?.campaignId || '',
        campaignTitle: initialValues?.campaignTitle || '',
        student: {
          department: initialValues?.student?.department || '',
          name: initialValues?.student?.name || '',
          profilePhoto: initialValues?.student?.profilePhoto || '',
          school: initialValues?.student?.school || '',
        },
        campaignTarget: initialValues?.campaignTarget || '',
        campaignType: initialValues?.campaignType || 'LongTerm',
        goals: initialValues?.goals || [],
        documents: initialValues?.documents || [],
        amountPerPayment: initialValues?.amountPerPayment || 0,
      }}
      validationSchema={() => deployContractSchema(t, campaignExist)}
      onSubmit={(values, { setSubmitting }) => onSubmit(values, setSubmitting)}
      enableReinitialize
    >
      {({
        isSubmitting,
        dirty,
        isValid,
        setFieldError,
        setFieldValue,
        setFieldTouched,
        values,
      }) => (
        <Form>
          <Flex flexDir={{ base: 'column', md: 'row' }}>
            <Input
              label={t('campaignId')}
              placeholder={t('example', { value: 'harry-potter' })}
              disabled={!isWalletExist || isEdit}
              name="campaignId"
              controlProps={{ mr: 4 }}
              onBlur={async e => {
                const target = e.currentTarget;
                setFieldValue('campaignId', target.value, false);
                setFieldTouched('campaignId', target.value, false);
                if (target.value && target.value.length >= 5) {
                  const isExist = await checkCampaignId(target.value);
                  if (isExist) {
                    setFieldError('campaignId', t('validations.idExist'));
                  } else {
                    setFieldTouched('campaignId', target.value, true);
                    setFieldError('campaignId', t('validations.required'));
                  }
                }
              }}
            />
            <Input
              label={t('campaignTitle')}
              placeholder={t('example', {
                value: 'Geleceğin bilim adamına yardım et.',
              })}
              disabled={!isWalletExist}
              name="campaignTitle"
            />
          </Flex>
          <Input
            label={t('namesurname')}
            placeholder={t('example', { value: 'Harry Potter' })}
            disabled={!isWalletExist}
            name="student.name"
          />
          <Flex flexDir={{ base: 'column', md: 'row' }}>
            <Input
              label={t('school')}
              name="student.school"
              placeholder={t('example', { value: 'Uludağ Üniversitesi' })}
              controlProps={{ mr: 4 }}
              disabled={!isWalletExist}
            />
            <Input
              label={t('department')}
              name="student.department"
              placeholder={t('example', { value: 'Gıda Mühendisliği' })}
              disabled={!isWalletExist}
            />
          </Flex>
          <Input
            label={t('profilePhoto')}
            placeholder={t('example', {
              value: 'https://www.ucurtmaprojesi.com/image/my-photo.png',
            })}
            disabled={!isWalletExist}
            name="student.profilePhoto"
          />
          <Flex flexDir={{ base: 'column', md: 'row' }}>
            <NumberInput
              label={t('campaignTarget')}
              name="campaignTarget"
              placeholder={t('example', { value: '12000' })}
              controlProps={{ mr: 4 }}
              type="number"
              disabled={!isWalletExist}
              addon={{
                left: (
                  <Image
                    maxW="12px"
                    width="full"
                    height="full"
                    src={`${process.env.PUBLIC_URL}/images/bilira-icon.svg`}
                    mr={1}
                  />
                ),
              }}
            />
            <Box width="full" mb={4}>
              <FormLabel color="gray.600">{t('campaignType.title')}</FormLabel>
              <RadioButtonGroup
                name="campaignType"
                defaultValue="LongTerm"
                isInline
                onChange={value => setFieldValue('campaignType', value)}
              >
                <CustomRadio
                  value="LongTerm"
                  key="long-term"
                  isDisabled={!isWalletExist}
                  variant="outline"
                >
                  {t('campaignType.longTerm')}
                </CustomRadio>
                <CustomRadio
                  value="ShortTerm"
                  key="short-term"
                  isDisabled={!isWalletExist}
                  variant="outline"
                >
                  {t('campaignType.shortTerm')}
                </CustomRadio>
              </RadioButtonGroup>
            </Box>
          </Flex>
          <Box width="full" mb={4}>
            <FormLabel color="gray.600">{t('goals.title')}</FormLabel>
            <FieldArray
              name="goals"
              render={arrayHelpers => (
                <Box
                  border="1px solid"
                  borderRadius="4px"
                  borderColor="gray.200"
                  p={4}
                >
                  {values?.goals?.map((goal, goalIndex) => {
                    return (
                      <Flex key={goalIndex.toString()}>
                        <Input
                          placeholder={t('example', {
                            value: 'Her ay notlarımı paylaşacağım.',
                          })}
                          disabled={!isWalletExist}
                          name={`goals.${goalIndex}.description`}
                          controlProps={{ mr: 4 }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          variantColor="red"
                          onClick={() => arrayHelpers.remove(goalIndex)}
                        >
                          <Box as={Trash2} size="16px" />
                        </Button>
                      </Flex>
                    );
                  })}
                  <Button
                    type="button"
                    variant="outline"
                    variantColor="gray"
                    size="sm"
                    onClick={() => arrayHelpers.push({ description: '' })}
                    mr={4}
                    width="full"
                    fontWeight={500}
                    disabled={
                      (values?.goals?.length > 0 &&
                        !values.goals[values.goals.length - 1].description) ||
                      !isWalletExist
                    }
                  >
                    <Box as={PlusCircle} mr={2} size="16px" />
                    {t('goals.new')}
                  </Button>
                </Box>
              )}
            />
          </Box>
          <Box width="full" mb={4}>
            <FormLabel color="gray.600">{t('documents.title')}</FormLabel>
            <FieldArray
              name="documents"
              render={arrayHelpers => (
                <Box
                  border="1px solid"
                  borderRadius="4px"
                  borderColor="gray.200"
                  p={4}
                >
                  {values?.documents?.map((document, documentIndex) => {
                    return (
                      <Flex key={documentIndex.toString()}>
                        <Input
                          label={t('documents.documentTitle')}
                          placeholder={t('example', {
                            value: 'LinkedIn Profili',
                          })}
                          disabled={!isWalletExist}
                          name={`documents.${documentIndex}.title`}
                          controlProps={{ mr: 4 }}
                        />
                        <Input
                          label={t('documents.link')}
                          placeholder={t('example', {
                            value: 'https://www.linkedin.com/',
                          })}
                          disabled={!isWalletExist}
                          name={`documents.${documentIndex}.link`}
                          controlProps={{ mr: 4 }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          variantColor="red"
                          onClick={() => arrayHelpers.remove(documentIndex)}
                          alignSelf="flex-end"
                          mb={4}
                          flexShrink={0}
                        >
                          <Box as={Trash2} size="16px" />
                        </Button>
                      </Flex>
                    );
                  })}
                  <Button
                    type="button"
                    variant="outline"
                    variantColor="gray"
                    size="sm"
                    onClick={() =>
                      arrayHelpers.push({ title: '', link: '', type: '' })
                    }
                    mr={4}
                    width="full"
                    fontWeight={500}
                    disabled={
                      (values?.documents?.length > 0 &&
                        !values.documents[values.documents.length - 1].title &&
                        !values.documents[values.documents.length - 1].link) ||
                      !isWalletExist
                    }
                  >
                    <Box as={PlusCircle} mr={2} size="16px" />
                    {t('documents.new')}
                  </Button>
                </Box>
              )}
            />
          </Box>
          {!initialValues?.ethereumAddress && (
            <Box
              border="1px solid"
              borderColor="gray.200"
              bg="gray.50"
              borderRadius="4px"
              p={4}
              mb={4}
            >
              <Flex
                justifyContent="space-between"
                alignItems="center"
                mb={showOwnerWallet ? 4 : 0}
              >
                <Heading size="sm" color="gray.600">
                  {t('owner')}
                </Heading>
                <Button
                  color={showOwnerWallet ? 'danger' : 'green.400'}
                  size="sm"
                  onClick={() => setShowOwnerWallet(!showOwnerWallet)}
                >
                  {t(showOwnerWallet ? 'deployLater' : 'showOwnerWallet')}
                  <Box
                    ml={2}
                    as={showOwnerWallet ? ChevronUp : ChevronDown}
                    size="16px"
                  />
                </Button>
              </Flex>
              {showOwnerWallet && (
                <>
                  <Input
                    description={t('aboutOwner')}
                    disabled={!isWalletExist}
                    name="owner"
                  />
                  <Flex flexDir={{ base: 'column', md: 'row' }}>
                    <NumberInput
                      label={t('numberOfPlannedPayouts')}
                      name="numberOfPlannedPayouts"
                      type="number"
                      controlProps={{ mr: 4 }}
                      disabled={!isWalletExist || !values.owner}
                    />
                    <NumberInput
                      label={t('withdrawPeriod')}
                      name="withdrawPeriod"
                      type="number"
                      addon={{ right: 'Gün' }}
                      disabled={!isWalletExist || !values.owner}
                      controlProps={{ mr: 4 }}
                    />
                    <NumberInput
                      label={t('campaignEndTime')}
                      name="campaignEndTime"
                      type="number"
                      addon={{ right: 'Gün' }}
                      disabled={!isWalletExist || !values.owner}
                    />
                  </Flex>
                  <NumberInput
                    label={t('amountPerPayment')}
                    name="amountPerPayment"
                    placeholder={t('example', { value: '1000' })}
                    controlProps={{ mr: 4 }}
                    type="number"
                    disabled={!isWalletExist || !values.owner}
                    addon={{
                      left: (
                        <Image
                          maxW="12px"
                          width="full"
                          height="full"
                          src={`${process.env.PUBLIC_URL}/images/bilira-icon.svg`}
                          mr={1}
                        />
                      ),
                    }}
                  />
                  <Input
                    label={t('adminAddress')}
                    value={mainState.wallet}
                    disabled
                    name="adminAddress"
                  />
                </>
              )}
            </Box>
          )}

          <Box id="editorjs" mb={4}>
            <FormLabel color="gray.600">{t('campaignDetails')}</FormLabel>
            <Box
              border="1px solid"
              borderColor="#e2e8f0"
              borderRadius="4px"
              as="textarea"
              ref={editorRef}
            />
          </Box>
          <Flex justifyContent="flex-end">
            {isEdit && (
              <Button
                type="button"
                variant="ghost"
                variantColor={activateStatus ? 'red' : 'green'}
                isLoading={loading}
                disabled={isSubmitting || !isValid}
                mr={4}
                onClick={() => onActivate(values.campaignId)}
                fontWeight={500}
              >
                {t(activateStatus ? 'deactivateCampaign' : 'activateCampaign')}
              </Button>
            )}
            <Button
              type="submit"
              variant="outline"
              variantColor="linkBlue"
              isLoading={loading}
              disabled={isSubmitting || !dirty || !isValid}
            >
              {t(isEdit ? 'EditAction' : 'DeployAction')}
            </Button>
          </Flex>
        </Form>
      )}
    </Formik>
  );
}

export default CreateCampaignForm;
