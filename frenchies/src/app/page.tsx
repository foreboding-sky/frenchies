'use client'

import Image from 'next/image';
import { Button, Typography, Row, Col, Card } from 'antd'
import styles from './home.module.css'

const { Title, Paragraph } = Typography

export default function HomePage() {
  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <Image
          src="/banner.jpg"
          alt="Salon Banner"
          width={1200}
          height={600}
          layout="responsive"
          className={styles.banner}
          quality={100}
        />
        <Title className={styles.title}>Welcome to Frenchies Beauty Salon</Title>
        <Paragraph className={styles.subtitle}>
          Pamper yourself with the best hair, nails, and skin care in town.
        </Paragraph>
        <Button type="primary" size="large">
          Book an Appointment
        </Button>
      </section>

      <section className={styles.services}>
        <Title level={2}>Our Services</Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Card title="Hair Styling" variant="outlined">
              Professional cuts, coloring & more.
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card title="Nail Care" variant="outlined">
              Manicures, pedicures, art design.
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card title="Skin Treatments" variant="outlined">
              Facials, masks, rejuvenation.
            </Card>
          </Col>
        </Row>
      </section>
    </div>
  )
}