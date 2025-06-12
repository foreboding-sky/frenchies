'use client';
import { Typography, Card, Row, Col, Space, Button } from 'antd';
import styles from './about.module.css';
import { InstagramOutlined, EnvironmentOutlined, PhoneOutlined, ClockCircleOutlined, EnvironmentFilled } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

export default function AboutPage() {
    return (
        <div className={styles.aboutWrapper}>
            <div className={styles.heroSection}>
                <Title level={1} className={styles.heroTitle}>About Frenchies</Title>
                <Paragraph className={styles.heroSubtitle}>
                    Where Beauty Meets Excellence
                </Paragraph>
            </div>

            <div className={styles.contentSection}>
                <Card className={styles.aboutCard}>
                    <Title level={2} className={styles.heading}>Our Story</Title>
                    <Paragraph className={styles.paragraph}>
                        Welcome to <strong>Frenchies Beauty Salon</strong> – your premier destination for luxury beauty services.
                        Founded with a passion for excellence and attention to detail, we&apos;ve created a sanctuary where
                        beauty meets sophistication.
                    </Paragraph>
                    <Paragraph className={styles.paragraph}>
                        Our team of experienced professionals is dedicated to providing you with personalized care and
                        exceptional service. From hair styling to nail care and skin treatments, we ensure every visit
                        leaves you feeling refreshed and confident.
                    </Paragraph>
                </Card>

                <Card className={styles.aboutCard}>
                    <Title level={2} className={styles.heading}>Visit Us</Title>
                    <div className={styles.mapContainer}>
                        <iframe
                            title="Frenchies Salon Location"
                            src="https://www.openstreetmap.org/export/embed.html?bbox=26.2715092%2C50.6208267%2C26.2755092%2C50.6228267&layer=mapnik&marker=50.6218267%2C26.2735092"
                            width="100%"
                            height="300"
                            style={{ border: 0 }}
                            className={styles.mapFrame}
                        />
                    </div>
                    <div className={styles.mapButtonContainer}>
                        <Button
                            type="primary"
                            icon={<EnvironmentFilled />}
                            href="https://www.google.com/maps/place/Ivana+Vyshenskoho+St,+3,+Rivne,+33017/@50.6218267,26.2735092,17z/data=!3m1!4b1!4m6!3m5!1s0x472f135f2b533ebd:0x30a78b3f3006a8b2!8m2!3d50.6218267!4d26.2735092!16s%2Fg%2F11c5m8j8_4?entry=ttu"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.mapButton}
                        >
                            Open in Google Maps
                        </Button>
                    </div>
                </Card>

                <Card className={styles.contactCard}>
                    <Row gutter={[32, 32]}>
                        <Col xs={24} sm={12} md={6}>
                            <Space direction="vertical" align="center" className={styles.contactItem}>
                                <EnvironmentOutlined className={styles.contactIcon} />
                                <div className={styles.contactInfo}>
                                    <strong>Address</strong>
                                    <p>Ivana Vyshenskoho St, 3,<br />Rivne, 33017</p>
                                </div>
                            </Space>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Space direction="vertical" align="center" className={styles.contactItem}>
                                <PhoneOutlined className={styles.contactIcon} />
                                <div className={styles.contactInfo}>
                                    <strong>Phone</strong>
                                    <p>+380 98 123 45 67</p>
                                </div>
                            </Space>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Space direction="vertical" align="center" className={styles.contactItem}>
                                <ClockCircleOutlined className={styles.contactIcon} />
                                <div className={styles.contactInfo}>
                                    <strong>Hours</strong>
                                    <div className={styles.hoursList}>
                                        <div className={styles.hoursRow}>
                                            <span>Mon-Fri:</span>
                                            <span>09:00–20:00</span>
                                        </div>
                                        <div className={styles.hoursRow}>
                                            <span>Saturday:</span>
                                            <span>09:00–18:00</span>
                                        </div>
                                        <div className={styles.hoursRow}>
                                            <span>Sunday:</span>
                                            <span className={styles.closed}>Closed</span>
                                        </div>
                                    </div>
                                </div>
                            </Space>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Space direction="vertical" align="center" className={styles.contactItem}>
                                <InstagramOutlined className={styles.contactIcon} />
                                <div className={styles.contactInfo}>
                                    <strong>Instagram</strong>
                                    <a
                                        href="https://www.instagram.com/frenchies.rivne/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.instagramLink}
                                    >
                                        @frenchies.rivne
                                    </a>
                                </div>
                            </Space>
                        </Col>
                    </Row>
                </Card>
            </div>
        </div>
    );
}