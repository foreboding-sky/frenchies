'use client';

import { Typography, Card, Col, Row, Spin, Image, Button } from 'antd';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarOutlined } from '@ant-design/icons';
import styles from './services.module.css';

const { Title, Paragraph } = Typography;

const servicesData = [
    {
        title: 'Hair Care',
        description: 'We offer professional hair care treatments including cuts, styling, coloring, and more.',
        image: '/hair-care.jpg',
        price: '$30 - $150',
    },
    {
        title: 'Nail Care',
        description: 'From manicures to pedicures, our nail care services are designed to make you feel pampered.',
        image: '/nail-care.jpg',
        price: '$20 - $100',
    },
    {
        title: 'Skin Care',
        description: 'Facials, skin treatments, and more to give your skin the care it deserves.',
        image: '/skin-care.jpg',
        price: '$40 - $200',
    },
];

export default function ServicesPage() {
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const q = query(collection(db, 'services'), where('isActive', '==', true));
                const snapshot = await getDocs(q);
                const servicesData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setServices(servicesData);
            } catch (error) {
                console.error('Error fetching services:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, []);

    return (
        <div className={styles.servicesPage}>
            <div className={styles.heroSection}>
                <Title level={1} className={styles.title}>Our Services</Title>
                <Paragraph className={styles.subtitle}>
                    Experience our range of premium beauty services, each designed to enhance your natural beauty
                    and provide you with a luxurious experience.
                </Paragraph>
                <Button
                    type="primary"
                    size="large"
                    icon={<CalendarOutlined />}
                    onClick={() => router.push('/appointment')}
                    className={styles.ctaButton}
                >
                    Book an Appointment
                </Button>
            </div>

            <div className={styles.contentSection}>
                {loading ? (
                    <div className={styles.loadingContainer}>
                        <Spin size="large" />
                    </div>
                ) : (
                    <Row gutter={[24, 24]} className={styles.servicesGrid}>
                        {services.map((service) => (
                            <Col key={service.id} xs={24} sm={12} lg={8}>
                                <Card
                                    hoverable
                                    className={styles.serviceCard}
                                    cover={
                                        <div className={styles.imageContainer}>
                                            <Image
                                                alt={service.title}
                                                src={service.image || 'https://via.placeholder.com/400x240'}
                                                height={200}
                                                width="100%"
                                                style={{ objectFit: 'cover' }}
                                                preview={false}
                                            />
                                        </div>
                                    }
                                >
                                    <div className={styles.cardContent}>
                                        <Title level={4} className={styles.cardTitle}>
                                            {service.title}
                                        </Title>
                                        <Paragraph className={styles.description}>
                                            {service.description}
                                        </Paragraph>
                                        <Paragraph className={styles.price}>
                                            ${service.price}
                                        </Paragraph>
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </div>
        </div>
    );
}