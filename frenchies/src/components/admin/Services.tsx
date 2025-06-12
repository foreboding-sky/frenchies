'use client';

import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Switch, message, Space, Popconfirm } from 'antd';
import type { Key } from 'antd/es/table/interface';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Service } from '@/types/services';
import styles from './Services.module.css';

const Services = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [form] = Form.useForm();

    const fetchServices = async () => {
        try {
            const servicesRef = collection(db, 'services');
            const servicesQuery = query(servicesRef, orderBy('title', 'asc'));
            const snapshot = await getDocs(servicesQuery);
            const servicesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Service[];
            setServices(servicesData);
        } catch (error) {
            console.error('Error fetching services:', error);
            message.error('Failed to fetch services');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const handleAdd = () => {
        setEditingService(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (service: Service) => {
        setEditingService(service);
        form.setFieldsValue({
            title: service.title,
            description: service.description,
            price: service.price,
            duration: service.duration,
            currency: service.currency,
            isActive: service.isActive,
            image: service.image
        });
        setModalVisible(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'services', id));
            message.success('Service deleted successfully');
            fetchServices();
        } catch (error) {
            console.error('Error deleting service:', error);
            message.error('Failed to delete service');
        }
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            const serviceData = {
                ...values,
                isActive: values.isActive ?? true
            };

            if (editingService) {
                await updateDoc(doc(db, 'services', editingService.id), serviceData);
                message.success('Service updated successfully');
            } else {
                await addDoc(collection(db, 'services'), serviceData);
                message.success('Service added successfully');
            }

            setModalVisible(false);
            fetchServices();
        } catch (error) {
            console.error('Error saving service:', error);
            message.error('Failed to save service');
        }
    };

    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            sorter: (a: Service, b: Service) => a.title.localeCompare(b.title),
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
        },
        {
            title: 'Duration (min)',
            dataIndex: 'duration',
            key: 'duration',
            sorter: (a: Service, b: Service) => a.duration - b.duration,
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            render: (price: number, record: Service) => `${record.currency} ${price.toFixed(2)}`,
            sorter: (a: Service, b: Service) => a.price - b.price,
        },
        {
            title: 'Status',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive: boolean) => (
                <span style={{ color: isActive ? '#52c41a' : '#ff4d4f' }}>
                    {isActive ? 'Active' : 'Inactive'}
                </span>
            ),
            filters: [
                { text: 'Active', value: true },
                { text: 'Inactive', value: false },
            ],
            onFilter: (value: boolean | Key, record: Service) => record.isActive === (value === true),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: Service) => (
                <Space>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Are you sure you want to delete this service?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                        >
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className={styles.servicesContainer}>
            <div className={styles.header}>
                <h2>Manage Services</h2>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                >
                    Add Service
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={services}
                rowKey="id"
                loading={loading}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} services`,
                }}
            />

            <Modal
                title={editingService ? 'Edit Service' : 'Add Service'}
                open={modalVisible}
                onOk={handleModalOk}
                onCancel={() => setModalVisible(false)}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                        isActive: true,
                        currency: '€'
                    }}
                >
                    <Form.Item
                        name="title"
                        label="Title"
                        rules={[{ required: true, message: 'Please enter the service title' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Description"
                        rules={[{ required: true, message: 'Please enter the service description' }]}
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>

                    <Form.Item
                        name="duration"
                        label="Duration (minutes)"
                        rules={[{ required: true, message: 'Please enter the service duration' }]}
                    >
                        <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="price"
                        label="Price"
                        rules={[{ required: true, message: 'Please enter the service price' }]}
                    >
                        <InputNumber
                            min={0}
                            step={0.01}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="currency"
                        label="Currency"
                        rules={[{ required: true, message: 'Please enter the currency' }]}
                    >
                        <Input maxLength={3} />
                    </Form.Item>

                    <Form.Item
                        name="image"
                        label="Image URL"
                        rules={[{ required: true, message: 'Please enter the image URL' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="isActive"
                        label="Status"
                        valuePropName="checked"
                    >
                        <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Services; 