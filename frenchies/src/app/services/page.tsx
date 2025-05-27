'use client';

import { Typography, Card, Col, Row, Spin, Image } from 'antd';
//import Image from 'next/image';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useEffect, useState } from 'react';

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
        <div className="services-page">
            <Title level={1}>Our Services</Title>
            {loading ? (
                <Spin />
            ) : (
                <Row gutter={[16, 16]}>
                    {services.map((service) => (
                        <Col key={service.id} xs={24} sm={12} lg={8}>
                            <Card
                                cover={
                                    <Image
                                        src={service.image}
                                        alt={service.title}
                                        width={350}
                                        height={200}
                                    //objectFit="cover"
                                    />
                                }
                                title={service.title}
                                variant="outlined"
                            >
                                <Paragraph>{service.description}</Paragraph>
                                <Paragraph><strong>Price:</strong> {service.price}</Paragraph>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </div>
    );
}