'use client';

import { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, Upload, message, Popconfirm, Switch, Tag, Select, App } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { collection, query, orderBy, getDocs, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Product } from '@/types/product';
import { Category } from '@/types/category';
import styles from './Products.module.css';
import type { UploadFile } from 'antd/es/upload/interface';

const { TextArea } = Input;

export default function Products() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [form] = Form.useForm();
    const [uploading, setUploading] = useState(false);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const { message: messageApi } = App.useApp();

    const fetchCategories = async () => {
        try {
            const categoriesRef = collection(db, 'categories');
            const q = query(categoriesRef, orderBy('name'));
            const querySnapshot = await getDocs(q);
            const categoriesData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                name: doc.data().name
            }));
            setCategories(categoriesData);
        } catch (error) {
            console.error('Error fetching categories:', error);
            messageApi.error('Failed to fetch categories');
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const productsRef = collection(db, 'products');
            const q = query(productsRef, orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const productsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Product[];
            setProducts(productsData);
        } catch (error) {
            console.error('Error fetching products:', error);
            messageApi.error('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const handleCreate = () => {
        setEditingProduct(null);
        form.resetFields();
        setFileList([]);
        setModalVisible(true);
    };

    const handleEdit = async (product: Product) => {
        setEditingProduct(product);
        // Convert existing images to fileList format
        const existingFiles = product.images.map((url, index) => ({
            uid: `-${index}`,
            name: `image-${index}`,
            status: 'done' as const,
            url: url
        }));
        setFileList(existingFiles);

        // If categories are not loaded yet, fetch them
        if (categories.length === 0) {
            await fetchCategories();
        }

        // Get category ID from the DocumentReference
        let categoryId = '';
        if (typeof product.categoryRef === 'string') {
            categoryId = product.categoryRef.split('/').pop() || '';
        } else if (product.categoryRef && typeof product.categoryRef === 'object') {
            categoryId = (product.categoryRef as any).id || '';
        }

        form.setFieldsValue({
            title: product.title,
            description: product.description,
            price: product.price,
            brand: product.brand,
            categoryRef: categoryId,
            discount: product.discount,
            featured: product.featured,
            isActive: product.isActive,
            stock: product.stock,
            tags: product.tags
        });
        setModalVisible(true);
    };

    const handleDelete = async (productId: string, images: string[]) => {
        try {
            // Delete all images from storage
            for (const imageUrl of images) {
                if (imageUrl) {
                    const imageRef = ref(storage, imageUrl);
                    await deleteObject(imageRef);
                }
            }

            // Delete the product document
            await deleteDoc(doc(db, 'products', productId));
            messageApi.success('Product deleted successfully');
            fetchProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
            messageApi.error('Failed to delete product');
        }
    };

    const handleSubmit = async (values: any) => {
        try {
            setUploading(true);
            let imageUrls = editingProduct?.images || [];

            // Upload new files
            const newFiles = fileList.filter(file => file.originFileObj);
            if (newFiles.length > 0) {
                const uploadPromises = newFiles.map(async (file) => {
                    const imageRef = ref(storage, `products/${Date.now()}_${file.name}`);
                    await uploadBytes(imageRef, file.originFileObj!);
                    return getDownloadURL(imageRef);
                });

                const newImageUrls = await Promise.all(uploadPromises);
                imageUrls = [...imageUrls, ...newImageUrls];

                // Delete old images if updating
                if (editingProduct?.images) {
                    const deletePromises = editingProduct.images.map(async (imageUrl) => {
                        if (imageUrl) {
                            const oldImageRef = ref(storage, imageUrl);
                            await deleteObject(oldImageRef);
                        }
                    });
                    await Promise.all(deletePromises);
                }
            }

            // Create the category reference path
            const categoryRef = `categories/${values.categoryRef}`;

            const productData = {
                title: values.title,
                description: values.description,
                price: values.price,
                brand: values.brand,
                categoryRef: categoryRef,
                discount: values.discount || 0,
                featured: values.featured || false,
                isActive: values.isActive || true,
                stock: values.stock || 0,
                tags: values.tags || [],
                images: imageUrls,
                updatedAt: serverTimestamp()
            };

            if (editingProduct) {
                await updateDoc(doc(db, 'products', editingProduct.id), productData);
                messageApi.success('Product updated successfully');
            } else {
                await addDoc(collection(db, 'products'), {
                    ...productData,
                    createdAt: serverTimestamp()
                });
                messageApi.success('Product created successfully');
            }

            setModalVisible(false);
            setFileList([]);
            fetchProducts();
        } catch (error) {
            console.error('Error saving product:', error);
            messageApi.error('Failed to save product');
        } finally {
            setUploading(false);
        }
    };

    const columns = [
        {
            title: 'Image',
            dataIndex: 'images',
            key: 'image',
            render: (images: string[]) => (
                <img
                    src={images?.[0] || '/placeholder.png'}
                    alt="Product"
                    className={styles.productImage}
                />
            ),
        },
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            sorter: (a: Product, b: Product) => a.title.localeCompare(b.title),
        },
        {
            title: 'Brand',
            dataIndex: 'brand',
            key: 'brand',
            sorter: (a: Product, b: Product) => a.brand.localeCompare(b.brand),
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            render: (price: number, record: Product) => (
                <span>
                    ${price.toFixed(2)}
                    {record.discount > 0 && (
                        <Tag color="red" style={{ marginLeft: 8 }}>
                            -{record.discount}%
                        </Tag>
                    )}
                </span>
            ),
            sorter: (a: Product, b: Product) => a.price - b.price,
        },
        {
            title: 'Stock',
            dataIndex: 'stock',
            key: 'stock',
            sorter: (a: Product, b: Product) => a.stock - b.stock,
        },
        {
            title: 'Status',
            key: 'status',
            render: (record: Product) => (
                <Space>
                    <Tag color={record.isActive ? 'green' : 'red'}>
                        {record.isActive ? 'Active' : 'Inactive'}
                    </Tag>
                    {record.featured && (
                        <Tag color="blue">Featured</Tag>
                    )}
                </Space>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: Product) => (
                <Space>
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Delete this product?"
                        description="Are you sure you want to delete this product? This action cannot be undone."
                        onConfirm={() => handleDelete(record.id, record.images)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button
                            icon={<DeleteOutlined />}
                            danger
                        >
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <App>
            <div className={styles.productsContainer}>
                <div className={styles.header}>
                    <h2>Products Management</h2>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleCreate}
                    >
                        Add Product
                    </Button>
                </div>

                <Table
                    columns={columns}
                    dataSource={products}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} products`
                    }}
                />

                <Modal
                    title={editingProduct ? 'Edit Product' : 'Add Product'}
                    open={modalVisible}
                    onCancel={() => {
                        setModalVisible(false);
                        setFileList([]);
                    }}
                    footer={null}
                    width={800}
                >
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        initialValues={{
                            price: 0,
                            discount: 0,
                            stock: 0,
                            featured: false,
                            isActive: true,
                            tags: []
                        }}
                    >
                        <Form.Item
                            name="title"
                            label="Title"
                            rules={[{ required: true, message: 'Please enter the product title' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="description"
                            label="Description"
                            rules={[{ required: true, message: 'Please enter the product description' }]}
                        >
                            <TextArea rows={4} />
                        </Form.Item>

                        <Form.Item
                            name="brand"
                            label="Brand"
                            rules={[{ required: true, message: 'Please enter the product brand' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="categoryRef"
                            label="Category"
                            rules={[{ required: true, message: 'Please select a category' }]}
                        >
                            <Select
                                placeholder="Select a category"
                                options={categories.map(category => ({
                                    label: category.name,
                                    value: category.id
                                }))}
                                showSearch
                                optionFilterProp="label"
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                            />
                        </Form.Item>

                        <Form.Item
                            name="price"
                            label="Price"
                            rules={[{ required: true, message: 'Please enter the product price' }]}
                        >
                            <InputNumber
                                min={0}
                                step={0.01}
                                prefix="$"
                                style={{ width: '100%' }}
                            />
                        </Form.Item>

                        <Form.Item
                            name="discount"
                            label="Discount (%)"
                        >
                            <InputNumber
                                min={0}
                                max={100}
                                step={1}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>

                        <Form.Item
                            name="stock"
                            label="Stock"
                            rules={[{ required: true, message: 'Please enter the product stock' }]}
                        >
                            <InputNumber
                                min={0}
                                step={1}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>

                        <Form.Item
                            name="tags"
                            label="Tags"
                        >
                            <Select
                                mode="tags"
                                style={{ width: '100%' }}
                                placeholder="Enter tags"
                            />
                        </Form.Item>

                        <Form.Item
                            name="featured"
                            label="Featured"
                            valuePropName="checked"
                        >
                            <Switch />
                        </Form.Item>

                        <Form.Item
                            name="isActive"
                            label="Active"
                            valuePropName="checked"
                        >
                            <Switch />
                        </Form.Item>

                        <Form.Item
                            label="Images"
                            required={!editingProduct}
                            rules={[{ required: !editingProduct, message: 'Please upload at least one product image' }]}
                        >
                            <Upload
                                listType="picture-card"
                                fileList={fileList}
                                onChange={({ fileList }) => setFileList(fileList)}
                                beforeUpload={() => false}
                                multiple
                            >
                                {fileList.length >= 8 ? null : (
                                    <div>
                                        <PlusOutlined />
                                        <div style={{ marginTop: 8 }}>Upload</div>
                                    </div>
                                )}
                            </Upload>
                        </Form.Item>

                        <Form.Item>
                            <Space>
                                <Button type="primary" htmlType="submit" loading={uploading}>
                                    {editingProduct ? 'Update' : 'Create'}
                                </Button>
                                <Button onClick={() => {
                                    setModalVisible(false);
                                    setFileList([]);
                                }}>
                                    Cancel
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </App>
    );
} 