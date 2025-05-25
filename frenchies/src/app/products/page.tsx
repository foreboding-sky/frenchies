'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Input, Select, List, Card, Typography, Tag, Image, Space, Button } from 'antd';
import AddToCartButton from '@/components/AddToCartButton';

const { Title } = Typography;
const { Option } = Select;

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [filtered, setFiltered] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
    const [categories, setCategories] = useState<any[]>([]);

    // Fetch products
    useEffect(() => {
        const fetchProducts = async () => {
            const productsSnapshot = await getDocs(
                query(collection(db, 'products'), where('isActive', '==', true))
            );
            const data = productsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setProducts(data);
            setFiltered(data);
        };

        fetchProducts();
    }, []);

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            const categoriesSnapshot = await getDocs(collection(db, 'categories'));
            const data = categoriesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setCategories(data);
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
        <div className="max-w-7xl mx-auto px-4 py-6">
            <Title level={2}>Products</Title>

            <Space style={{ marginBottom: 20 }} direction="horizontal">
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

            <List
                grid={{ gutter: 16, column: 3 }}
                dataSource={filtered}
                renderItem={product => (
                    <List.Item>
                        <Card
                            hoverable
                            cover={
                                <Image
                                    alt={product.title}
                                    src={product.images?.[0]}
                                    height={200}
                                    width="100%"
                                    style={{ objectFit: 'cover' }}
                                    preview={false}
                                />
                            }
                        >
                            <Title level={4}>{product.title}</Title>
                            <p>{product.description?.slice(0, 60)}...</p>
                            <p><strong>${product.price}</strong></p>
                            <div>
                                {product.tags?.map((tag: string) => (
                                    <Tag key={tag}>{tag}</Tag>
                                ))}
                            </div>
                            <AddToCartButton product={product} compact />
                            <Link href={`/products/${product.id}`}>
                                <Button type="link">View Product</Button>
                            </Link>
                        </Card>
                    </List.Item>
                )}
            />
        </div>
    );
}