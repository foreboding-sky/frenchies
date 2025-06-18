'use client'

import Image from 'next/image';
import { Button, Typography, Row, Col, Card, Space } from 'antd'
import styles from './home.module.css'
import { useRouter } from 'next/navigation';
import { CalendarOutlined, ScissorOutlined, SmileOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography

export default function HomePage() {
  const router = useRouter();

  const bookAppointment = () => {
    router.push(`/appointment`);
  }

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <div className={styles.bannerContainer}>
          <Image
            src="/banner.jpg"
            alt="Salon Banner"
            fill
            className={styles.banner}
            quality={100}
            priority
          />
          <div className={styles.overlay}>
            <Title className={styles.title}>Ласкаво просимо до салону краси Frenchies</Title>
            <Paragraph className={styles.subtitle}>
              Відчуйте розкіш та елегантність у кожній послузі
            </Paragraph>
            <Button
              type="primary"
              size="large"
              onClick={bookAppointment}
              icon={<CalendarOutlined />}
              className={styles.ctaButton}
            >
              Записатися
            </Button>
          </div>
        </div>
      </section>

      <section className={styles.services}>
        <Title level={2} className={styles.sectionTitle}>Наші послуги</Title>
        <Paragraph className={styles.sectionSubtitle}>
          Відкрийте для себе наш асортимент преміальних косметичних послуг
        </Paragraph>
        <Row gutter={[32, 32]} className={styles.serviceCards}>
          <Col xs={24} sm={12} md={8}>
            <Card
              className={styles.serviceCard}
              cover={<div className={styles.cardIcon}><ScissorOutlined /></div>}
            >
              <Card.Meta
                title="Укладка волосся"
                description="Професійні стрижки, фарбування та укладання, адаптовані до вашого унікального образу."
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card
              className={styles.serviceCard}
              cover={<div className={styles.cardIcon}><SmileOutlined /></div>}
            >
              <Card.Meta
                title="Манікюр"
                description="Професійний манікюр, педикюр та художній дизайн нігтів для вашого ідеального образу."
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card
              className={styles.serviceCard}
              cover={<div className={styles.cardIcon}><SmileOutlined /></div>}
            >
              <Card.Meta
                title="Процедури для шкіри"
                description="Омолоджувальні процедури для обличчя, маски та спеціалізовані процедури догляду за шкірою."
              />
            </Card>
          </Col>
        </Row>
      </section>
    </div>
  )
}