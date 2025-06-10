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
            <Title className={styles.title}>Welcome to Frenchies Beauty Salon</Title>
            <Paragraph className={styles.subtitle}>
              Experience luxury and elegance in every service
            </Paragraph>
            <Button
              type="primary"
              size="large"
              onClick={bookAppointment}
              icon={<CalendarOutlined />}
              className={styles.ctaButton}
            >
              Book an Appointment
            </Button>
          </div>
        </div>
      </section>

      <section className={styles.services}>
        <Title level={2} className={styles.sectionTitle}>Our Services</Title>
        <Paragraph className={styles.sectionSubtitle}>
          Discover our range of premium beauty services
        </Paragraph>
        <Row gutter={[32, 32]} className={styles.serviceCards}>
          <Col xs={24} sm={12} md={8}>
            <Card
              className={styles.serviceCard}
              cover={<div className={styles.cardIcon}><ScissorOutlined /></div>}
            >
              <Card.Meta
                title="Hair Styling"
                description="Professional cuts, coloring, and styling services tailored to your unique look."
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card
              className={styles.serviceCard}
              cover={<div className={styles.cardIcon}><SmileOutlined /></div>}
            >
              <Card.Meta
                title="Nail Care"
                description="Expert manicures, pedicures, and artistic nail designs for your perfect look."
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card
              className={styles.serviceCard}
              cover={<div className={styles.cardIcon}><SmileOutlined /></div>}
            >
              <Card.Meta
                title="Skin Treatments"
                description="Rejuvenating facials, masks, and specialized skin care treatments."
              />
            </Card>
          </Col>
        </Row>
      </section>
    </div>
  )
}