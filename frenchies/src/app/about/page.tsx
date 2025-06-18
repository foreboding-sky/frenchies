'use client';
import { Typography, Card, Row, Col, Space, Button } from 'antd';
import styles from './about.module.css';
import { InstagramOutlined, EnvironmentOutlined, PhoneOutlined, ClockCircleOutlined, EnvironmentFilled } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

export default function AboutPage() {
    return (
        <div className={styles.aboutWrapper}>
            <div className={styles.heroSection}>
                <Title level={1} className={styles.heroTitle}>Про салон Frenchies</Title>
                <Paragraph className={styles.heroSubtitle}>
                    Де краса зустрічається з досконалістю
                </Paragraph>
            </div>

            <div className={styles.contentSection}>
                <Card className={styles.aboutCard}>
                    <Title level={2} className={styles.heading}>Наша історія</Title>
                    <Paragraph className={styles.paragraph}>
                        Ласкаво просимо до <strong>Салону краси Frenchies</strong> – вашого найкращого місця для пошуку розкішних косметичних послуг.
                        Засновані з пристрастю до досконалості та увагою до деталей, ми створили затишок, де краса зустрічається з вишуканістю.
                    </Paragraph>
                    <Paragraph className={styles.paragraph}>
                        Наша команда досвідчених фахівців прагне забезпечити вам персоналізований догляд та винятковий сервіс. Від укладання волосся до догляду за нігтями та шкірою, ми гарантуємо, що кожен візит залишить вас бадьорими та впевненими.
                    </Paragraph>
                </Card>

                <Card className={styles.aboutCard}>
                    <Title level={2} className={styles.heading}>Відвідайте нас</Title>
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
                            Відкрити в Google Maps
                        </Button>
                    </div>
                </Card>

                <Card className={styles.contactCard}>
                    <Row gutter={[32, 32]}>
                        <Col xs={24} sm={12} md={6}>
                            <Space direction="vertical" align="center" className={styles.contactItem}>
                                <EnvironmentOutlined className={styles.contactIcon} />
                                <div className={styles.contactInfo}>
                                    <strong>Адреса</strong>
                                    <p>Івана Вишенського, 3,<br />Рівне, 33017</p>
                                </div>
                            </Space>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Space direction="vertical" align="center" className={styles.contactItem}>
                                <PhoneOutlined className={styles.contactIcon} />
                                <div className={styles.contactInfo}>
                                    <strong>Телефон</strong>
                                    <p>+380 98 123 45 67</p>
                                </div>
                            </Space>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Space direction="vertical" align="center" className={styles.contactItem}>
                                <ClockCircleOutlined className={styles.contactIcon} />
                                <div className={styles.contactInfo}>
                                    <strong>Графік</strong>
                                    <div className={styles.hoursList}>
                                        <div className={styles.hoursRow}>
                                            <span>Пн-Пт:</span>
                                            <span>09:00–20:00</span>
                                        </div>
                                        <div className={styles.hoursRow}>
                                            <span>Субота:</span>
                                            <span>09:00–18:00</span>
                                        </div>
                                        <div className={styles.hoursRow}>
                                            <span>Неділя:</span>
                                            <span className={styles.closed}>Закрито</span>
                                        </div>
                                    </div>
                                </div>
                            </Space>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Space direction="vertical" align="center" className={styles.contactItem}>
                                <InstagramOutlined className={styles.contactIcon} />
                                <div className={styles.contactInfo}>
                                    <strong>Інстаграм</strong>
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