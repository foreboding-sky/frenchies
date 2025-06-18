'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Typography, Spin, Image, Button } from 'antd';
import { ArrowLeftOutlined, TagOutlined, ShoppingOutlined } from '@ant-design/icons';
import AddToCartButton from '@/components/AddToCartButton';
import { Product } from '@/types/product';
import styles from './product.module.css';

const { Title, Text, Paragraph } = Typography;

export default function ProductDetailsPage() {
    const { productId } = useParams();
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [categoryName, setCategoryName] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const productRef = doc(db, 'products', productId as string);
                const productSnap = await getDoc(productRef);

                if (productSnap.exists()) {
                    const data = {
                        id: productSnap.id,
                        ...(productSnap.data() as Omit<Product, 'id'>),
                    } as Product;
                    setProduct(data);

                    if (data.categoryId) {
                        const categoryRef = doc(db, 'categories', data.categoryId);
                        const categorySnap = await getDoc(categoryRef);
                        if (categorySnap.exists()) {
                            setCategoryName(categorySnap.data().name);
                        }
                    }
                }
            } catch (err) {
                console.error('Failed to fetch product:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId]);

    if (loading) {
        return (
            <div className={styles.productPage}>
                <div className={styles.loadingContainer}>
                    <Spin size="large" />
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className={styles.productPage}>
                <div className={styles.contentSection}>
                    <Text>Product not found.</Text>
                </div>
            </div>
        );
    }

    const discountedPrice = product.discount
        ? product.price - (product.price * product.discount / 100)
        : product.price;

    return (
        <div className={styles.productPage}>
            <div className={styles.contentSection}>
                <div className={styles.navigation}>
                    <Button
                        type="default"
                        icon={<ArrowLeftOutlined />}
                        className={styles.navButton}
                        onClick={() => router.back()}
                    >
                        Назад
                    </Button>
                </div>
                <div className={styles.productContent}>
                    <div className={styles.imageSection}>
                        <Image
                            src={product.images?.[selectedImage] ? `/${product.images[selectedImage]}` : '/no-image.svg'}
                            alt={product.title}
                            className={styles.mainImage}
                            preview={false}
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/no-image.svg';
                            }}
                        />
                        {product.images && product.images.length > 1 && (
                            <div className={styles.thumbnailContainer}>
                                {product.images.filter(url => url && url.trim() !== '').map((url, index) => (
                                    <Image
                                        key={index}
                                        src={`/${url}`}
                                        alt={`${product.title} thumbnail ${index + 1}`}
                                        className={`${styles.thumbnail} ${selectedImage === index ? styles.active : ''}`}
                                        onClick={() => setSelectedImage(index)}
                                        preview={false}
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = '/no-image.svg';
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className={styles.infoSection}>
                        <Title level={2} className={styles.title}>{product.title}</Title>

                        <div className={styles.priceSection}>
                            {product.discount && product.discount > 0 ? (
                                <>
                                    <Text className={styles.price}>
                                        ${(product.price - (product.price * product.discount / 100)).toFixed(2)}
                                    </Text>
                                    <Text className={styles.originalPrice}>${product.price.toFixed(2)}</Text>
                                    <Text className={styles.discount}>{product.discount}% OFF</Text>
                                </>
                            ) : (
                                <Text className={styles.price}>
                                    ${product.price.toFixed(2)}
                                </Text>
                            )}
                        </div>

                        <Paragraph className={styles.description}>{product.description}</Paragraph>

                        <div className={styles.metaInfo}>
                            <div className={styles.metaItem}>
                                <div className={styles.metaIcon}>
                                    <TagOutlined />
                                </div>
                                <div className={styles.metaContent}>
                                    <Text className={styles.metaLabel}>Категорія</Text>
                                    <Text className={styles.metaValue}>{categoryName || 'Невідомо'}</Text>
                                </div>
                            </div>
                            <div className={styles.metaItem}>
                                <div className={styles.metaIcon}>
                                    <ShoppingOutlined />
                                </div>
                                <div className={styles.metaContent}>
                                    <Text className={styles.metaLabel}>В наявності</Text>
                                    <Text className={`${styles.metaValue} ${styles.stockStatus} ${product.stock > 0 ? styles.inStock : styles.outOfStock}`}>
                                        {product.stock > 0 ? `${product.stock} шт у наявності` : 'Закінчилось'}
                                    </Text>
                                </div>
                            </div>
                        </div>

                        {product.tags && product.tags.length > 0 && (
                            <div className={styles.tags}>
                                {product.tags.map((tag, index) => (
                                    <span key={index} className={styles.tag}>{tag}</span>
                                ))}
                            </div>
                        )}

                        <div className={styles.actions}>
                            <AddToCartButton product={product} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
