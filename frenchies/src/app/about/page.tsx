'use client';
import { Typography, Card } from 'antd';
import styles from './about.module.css';
import { InstagramOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

export default function AboutPage() {
    return (
        <div className={styles.aboutWrapper}>
            <Card className={styles.aboutCard} variant="outlined">
                <Title level={2} className={styles.heading}>About Us</Title>
                <Paragraph className={styles.paragraph}>
                    Welcome to <strong>Frenchies Beauty Salon</strong> – your go-to destination for premium beauty services.
                    We specialize in hair, nail, and skincare treatments delivered by experienced professionals
                    in a relaxing atmosphere.
                </Paragraph>

                <Title level={4} className={styles.subheading}>Visit Us</Title>
                <div className={styles.mapContainer}>
                    <iframe
                        title="Google Maps - Frenchies Salon"
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d632.8211890802921!2d26.273509169722058!3d50.62182674907184!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x472f135f2b533ebd%3A0x30a78b3f3006a8b2!2z0LLRg9C70LjRhtGPINCG0LLQsNC90LAg0JLQuNGI0LXQvdGB0YzQutC-0LPQviwgMywg0KDRltCy0L3QtSwg0KDRltCy0L3QtdC90YHRjNC60LAg0L7QsdC70LDRgdGC0YwsIDMzMDE3!5e0!3m2!1suk!2sua!4v1747230077284!5m2!1suk!2sua"
                        width="100%"
                        height="400"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                    />
                </div>

                <Paragraph className={styles.paragraph}>
                    📍 <strong>Address:</strong> Ivana Vyshenskoho St, 3, Rivne, Rivnens'ka oblast, 33017 <br />
                    📞 <strong>Phone:</strong> +380 98 123 45 67 <br />
                    🕘 <strong>Open:</strong> Mon–Sat 09:00–20:00 <br />
                    <InstagramOutlined className={styles.instagramIcon} style={{ marginLeft: 1.5 }} /><strong>Instagram:</strong>  <a
                        href="https://www.instagram.com/frenchies.rivne/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.instagramText}
                    >
                        @frenchies.rivne
                    </a>
                </Paragraph>
            </Card>
        </div>
    );
}