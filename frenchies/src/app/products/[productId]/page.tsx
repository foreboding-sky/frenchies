'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, Typography, Spin, Tag, Image, Button } from 'antd';
import Link from 'next/link';
import AddToCartButton from '@/components/AddToCartButton';
import { Product } from '@/types/product';

const { Title, Paragraph } = Typography;

export default function ProductDetailsPage() {
    const { productId } = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [categoryName, setCategoryName] = useState<string>('');
    const [loading, setLoading] = useState(true);

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

    if (loading) return <Spin size="large" />;

    if (!product) return <p>Product not found.</p>;

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow">
            <Link href="/products">
                <Button type="link">← Back to Products</Button>
            </Link>
            <Title>{product.title}</Title>
            <Image.PreviewGroup>
                {product.images?.map((url: string, idx: number) => (
                    <Image key={idx} src={url} width={200} className="mr-3 mb-3" />
                ))}
            </Image.PreviewGroup>
            <Paragraph>Title: {product.title}</Paragraph>
            <Paragraph>Stock: {product.stock}</Paragraph>
            <Paragraph strong>Price: ${product.price}</Paragraph>
            {product.discount &&
                <>
                    <Paragraph>Discount: {product.discount}%</Paragraph>
                    <Paragraph strong>Total price: ${(product.price - product.price * product.discount / 100).toFixed(2)}</Paragraph>
                </>}
            <AddToCartButton product={product} />
            <Paragraph>Category: {categoryName}</Paragraph>
            <Paragraph>{product.description}</Paragraph>
            <div className="mt-4">
                {product.tags?.map((tag: string, i: number) => (
                    <Tag key={i}>{tag}</Tag>
                ))}
            </div>
        </div>
    );
}
