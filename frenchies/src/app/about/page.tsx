'use client';
import { Typography, Card, Row, Col, Space } from 'antd';
import styles from './about.module.css';
import { InstagramOutlined, EnvironmentOutlined, PhoneOutlined, ClockCircleOutlined } from '@ant-design/icons';

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
                        Founded with a passion for excellence and attention to detail, we've created a sanctuary where
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
                            title="Google Maps - Frenchies Salon"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d632.8211890802921!2d26.273509169722058!3d50.62182674907184!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x472f135f2b533ebd%3A0x30a78b3f3006a8b2!2z0LLRg9C70LjRhtGPINCG0LLQsNC90LAg0JLQuNGI0LXQvdGB0YzQutC-0LPQviwgMywg0KDRltCy0L3QtSwg0KDRltCy0L3QtdC90YHRjNC60LAg0L7QsdC70LDRgdGC0YwsIDMzMDE3!5e0!3m2!1suk!2sua!4v1747230077284!5m2!1suk!2sua"
                            width="100%"
                            height="300"
                            style={{ border: 0 }}
                            loading="lazy"
                            allowFullScreen
                        />
                    </div>
                </Card>

                <Card className={styles.contactCard}>
                    <Row gutter={[48, 48]}>
                        <Col xs={24} sm={12} md={6}>
                            <Space direction="vertical" align="center" className={styles.contactItem}>
                                <EnvironmentOutlined className={styles.contactIcon} />
                                <div>
                                    <strong>Address</strong>
                                    <p>Ivana Vyshenskoho St, 3,<br />Rivne, 33017</p>
                                </div>
                            </Space>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Space direction="vertical" align="center" className={styles.contactItem}>
                                <PhoneOutlined className={styles.contactIcon} />
                                <div>
                                    <strong>Phone</strong>
                                    <p>+380 98 123 45 67</p>
                                </div>
                            </Space>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Space direction="vertical" align="center" className={styles.contactItem}>
                                <ClockCircleOutlined className={styles.contactIcon} />
                                <div>
                                    <strong>Hours</strong>
                                    <p>Mon–Sat<br />09:00–20:00</p>
                                </div>
                            </Space>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Space direction="vertical" align="center" className={styles.contactItem}>
                                <InstagramOutlined className={styles.contactIcon} />
                                <div>
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