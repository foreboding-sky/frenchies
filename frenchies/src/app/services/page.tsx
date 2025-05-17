'use client';

import { Typography, Card, Col, Row } from 'antd';
import Image from 'next/image';

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
    return (
        <div className="services-page">
            <Title level={1}>Our Services</Title>
            <Row gutter={[16, 16]}>
                {servicesData.map((service, index) => (
                    <Col key={index} xs={24} sm={12} lg={8}>
                        <Card
                            cover={<Image src={service.image} alt={service.title} width={350} height={200} objectFit="cover" />}
                            title={service.title}
                            variant='outlined'
                        >
                            <Paragraph>{service.description}</Paragraph>
                            <Paragraph><strong>Price:</strong> {service.price}</Paragraph>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
}