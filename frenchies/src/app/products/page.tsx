'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Input, Select, List, Card, Typography, Tag, Image, Space, Button, Spin } from 'antd';
import AddToCartButton from '@/components/AddToCartButton';
import styles from './products.module.css';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [filtered, setFiltered] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch products
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const productsSnapshot = await getDocs(
                    query(collection(db, 'products'), where('isActive', '==', true))
                );
                const data = productsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setProducts(data);
                setFiltered(data);
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const categoriesSnapshot = await getDocs(collection(db, 'categories'));
                const data = categoriesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setCategories(data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, []);

    // Filter logic
    useEffect(() => {
        const results = products.filter(p =>
            p.title.toLowerCase().includes(search.toLowerCase()) &&
            (!categoryFilter || p.categoryId === categoryFilter)
        );
        setFiltered(results);
    }, [search, categoryFilter, products]);

    return (
        <div className={styles.productsPage}>
            <div className={styles.heroSection}>
                <Title level={1} className={styles.title}>Our Products</Title>
                <Paragraph className={styles.subtitle}>
                    Discover our curated collection of premium beauty products, carefully selected to enhance your natural beauty
                    and provide you with the best care for your skin and hair.
                </Paragraph>
            </div>

            <div className={styles.contentSection}>
                <div className={styles.filtersSection}>
                    <Space direction="horizontal" size="middle" style={{ width: '100%', justifyContent: 'center' }}>
                        <Input.Search
                            placeholder="Search products..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            allowClear
                            style={{ width: 300 }}
                        />
                        <Select
                            placeholder="Filter by category"
                            allowClear
                            onChange={(value) => setCategoryFilter(value)}
                            style={{ width: 200 }}
                        >
                            {categories.map((cat) => (
                                <Option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </Option>
                            ))}
                        </Select>
                    </Space>
                </div>

                {loading ? (
                    <div className={styles.loadingContainer}>
                        <Spin size="large" />
                    </div>
                ) : (
                    <List
                        grid={{ gutter: 24, xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 4 }}
                        dataSource={filtered}
                        className={styles.productsGrid}
                        renderItem={product => (
                            <List.Item>
                                <Card
                                    hoverable
                                    className={styles.productCard}
                                    cover={
                                        <div className={styles.imageContainer}>
                                            <Image
                                                alt={product.title}
                                                src={product.images?.[0] || 'https://via.placeholder.com/400x240'}
                                                preview={false}
                                            />
                                        </div>
                                    }
                                >
                                    <div className={styles.cardContent}>
                                        <Title level={4} className={styles.cardTitle}>
                                            {product.title}
                                        </Title>
                                        <Paragraph className={styles.description}>
                                            {product.description}
                                        </Paragraph>
                                        <Text className={styles.price}>
                                            ${product.price}
                                        </Text>
                                        {product.tags && product.tags.length > 0 && (
                                            <div className={styles.tags}>
                                                {product.tags.map((tag: string) => (
                                                    <Tag key={tag} className={styles.tag}>{tag}</Tag>
                                                ))}
                                            </div>
                                        )}
                                        <div className={styles.actions}>
                                            <AddToCartButton product={product} compact />
                                            <Link href={`/products/${product.id}`} className={styles.detailsButton}>
                                                <Button type="default" size="middle">
                                                    Details
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </Card>
                            </List.Item>
                        )}
                    />
                )}
            </div>
        </div>
    );
}