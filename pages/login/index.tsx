import { useMutation, useQuery } from '@apollo/react-hooks'
import { Alert, Button, Form, Input, message } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { AuthFooter } from 'components/auth/footer'
import { AuthLayout } from 'components/auth/layout'
import { setAuth } from 'components/with.auth'
import {
  LOGIN_MUTATION,
  LoginMutationData,
  LoginMutationVariables,
} from 'graphql/mutation/login.mutation'
import { NextPage } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import { Omf } from '../../components/omf'
import { SETTINGS_QUERY, SettingsQueryData } from '../../graphql/query/settings.query'
import scss from './index.module.scss'

const Index: NextPage = () => {
  const { t } = useTranslation()
  const [form] = useForm()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [login] = useMutation<LoginMutationData, LoginMutationVariables>(LOGIN_MUTATION)
  const { data } = useQuery<SettingsQueryData>(SETTINGS_QUERY)

  const finish = async (data: LoginMutationVariables) => {
    setLoading(true)
    try {
      const result = await login({
        variables: data,
      })

      setAuth(result.data.tokens.access, result.data.tokens.refresh)

      await message.success(t('login:welcomeBack'))

      await router.push('/admin')
    } catch (e) {
      await message.error(t('login:invalidLoginCredentials'))
    }

    setLoading(false)
  }

  const failed = async () => {
    await message.error(t('validation:mandatoryFieldsMissing'))
  }

  return (
    <AuthLayout loading={loading}>
      <Omf />
      <Form
        form={form}
        name="login"
        onFinish={finish}
        onFinishFailed={failed}
        style={{
          margin: 'auto',
          maxWidth: '95%',
          width: 400,
        }}
      >
        <img
          src={require('../../assets/images/logo_white_small.png') as string}
          alt={'OhMyForm'}
          style={{
            display: 'block',
            width: '70%',
            marginLeft: 'auto',
            marginRight: 'auto',
            marginBottom: 16,
          }}
        />

        {data && (
          <Alert
            type="warning"
            showIcon
            message={t('login:note')}
            description={<ReactMarkdown escapeHtml={false} source={data.loginNote.value} />}
            style={{
              marginBottom: 24,
            }}
          />
        )}

        <Form.Item
          name="username"
          rules={[{ required: true, message: t('validation:usernameRequired') }]}
        >
          <Input size="large" placeholder={t('login:usernamePlaceholder')} />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: t('validation:passwordRequired') }]}
        >
          <Input.Password size="large" placeholder={t('login:passwordPlaceholder')} />
        </Form.Item>

        <Form.Item>
          <Button size="large" type="primary" htmlType="submit" block>
            {t('login:loginNow')}
          </Button>
        </Form.Item>

        <Button.Group className={scss.otherActions}>
          {(!data || !data.disabledSignUp.value) && (
            <Link href={'/register'}>
              <Button type={'link'} ghost>
                {t('register')}
              </Button>
            </Link>
          )}
          <Link href={'/login/recover'}>
            <Button type={'link'} ghost>
              {t('recover')}
            </Button>
          </Link>
        </Button.Group>
      </Form>

      <AuthFooter />
    </AuthLayout>
  )
}

export default Index
