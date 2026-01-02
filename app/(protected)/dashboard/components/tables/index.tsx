"use client";
import React, { useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  ScrollShadow,
  Tabs,
  Tab,
  Badge,
  Progress,
  Alert,
} from "@heroui/react";
import {
  Check,
  HourglassIcon,
  RupeeIcon,
  Table02Icon,
  TagIcon,
  WaiterIcon,
  ClockIcon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
  ChefHatIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import useSWR from "swr";
import TableSkeleton from './skaleton';
import { Table } from '@prisma/client';
const fetcher = (url: string) => fetch(url).then((res) => res.json());

function tableStatus(status: string): {
  colour: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  icon: any;
} {
  switch (status) {
    case "occupied":
      return { colour: "warning", icon: HourglassIcon };
    case "available":
      return { colour: "success", icon: Check };
    case "reserved":
      return { colour: "secondary", icon: TagIcon };
    default:
      return { colour: "default", icon: Check };
  }
}

function itemStatusConfig(status: string) {
  switch (status) {
    case "completed":
      return { colour: "success" as const, icon: CheckmarkCircle02Icon, label: "Served" };
    case "pending":
      return { colour: "warning" as const, icon: ChefHatIcon, label: "Preparing" };
    case "cancelled":
      return { colour: "danger" as const, icon: Cancel01Icon, label: "Cancelled" };
    default:
      return { colour: "default" as const, icon: ClockIcon, label: "Unknown" };
  }
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date);
}

function getTimeSince(date: Date) {
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m ago`;
}

export default function TablesComponent() {
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const { data, error, isLoading } = useSWR(`/api/tables`, fetcher);

  const handleTableClick = (table: any) => {
    setSelectedTable(table);
    setShowModal(true);
  };

  const getOrderStats = (order: any) => {
    const total = order.items.length;
    const completed = order.items.filter((i: any) => i.status === 'completed').length;
    const pending = order.items.filter((i: any) => i.status === 'pending').length;
    return { total, completed, pending, percentage: (completed / total) * 100 };
  };
  if (isLoading) return <TableSkeleton/>;
  if (error)
    return <Alert color={"danger"} title={`Something went wronng, please refresh!`} />;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {data?.data?.map((table) => {
          const currentOrder = table.orders[0];
          const stats = currentOrder ? getOrderStats(currentOrder) : null;

          return (
            <Card
              key={table.id}
              isPressable
              onPress={() => handleTableClick(table)}
              className={`border-2 border-${tableStatus(table.status).colour}-200 hover:scale-105 cursor-pointer transition-all duration-300 ease-in-out hover:shadow-lg`}
            >
              <CardHeader
                className={`flex relative justify-between items-start bg-${tableStatus(table.status).colour}/10 text-${tableStatus(table.status).colour}-800 min-h-22`}
              >
                <div className="flex items-baseline gap-1">
                  <HugeiconsIcon icon={Table02Icon} className="size-6 opacity-50" />
                  <p className="text-6xl font-bold">{table.number}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Chip
                    startContent={
                      <HugeiconsIcon
                        icon={tableStatus(table.status).icon}
                        className="size-4"
                      />
                    }
                    variant="flat"
                    color={tableStatus(table.status).colour}
                    size="sm"
                  >
                    <span className="capitalize">{table.status}</span>
                  </Chip>
                  {table.waiter && (
                    <p className="flex gap-1 items-center text-xs text-gray-600">
                      <HugeiconsIcon icon={WaiterIcon} className="size-3" />
                      {table.waiter}
                    </p>
                  )}
                </div>
              </CardHeader>
              <Divider className={`bg-${tableStatus(table.status).colour}/30`} />
              <CardBody className="flex items-center justify-center py-4">
                {table.status !== "occupied" ? (
                  <p className="text-gray-500 text-sm">Table {table.status}</p>
                ) : currentOrder ? (
                  <div className="flex-1 w-full space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-500">Items</p>
                        <p className="text-2xl font-bold">
                          {stats?.completed}/{stats?.total}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Bill</p>
                        <p className="text-2xl font-bold flex items-center">
                          <HugeiconsIcon icon={RupeeIcon} className="size-5" />
                          {currentOrder.total.toFixed(0)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Order Progress</span>
                        <span>{stats?.percentage.toFixed(0)}%</span>
                      </div>
                      <Progress
                        value={stats?.percentage}
                        color={stats?.percentage === 100 ? "success" : "warning"}
                        size="sm"
                      />
                    </div>

                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <HugeiconsIcon icon={ClockIcon} className="size-3" />
                      {getTimeSince(new Date(currentOrder.createdAt))}
                    </div>
                  </div>
                ) : null}
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Order Detail Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        size="3xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {selectedTable && (
            <>
              <ModalHeader className="flex flex-col gap-2 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-baseline gap-2">
                      <HugeiconsIcon icon={Table02Icon} className="size-8 text-gray-400" />
                      <h2 className="text-3xl font-bold">Table {selectedTable.number}</h2>
                    </div>
                    <Chip
                      startContent={
                        <HugeiconsIcon
                          icon={tableStatus(selectedTable.status).icon}
                          className="size-4"
                        />
                      }
                      variant="flat"
                      color={tableStatus(selectedTable.status).colour}
                    >
                      {selectedTable.status}
                    </Chip>
                  </div>
                  {selectedTable.waiter && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <HugeiconsIcon icon={WaiterIcon} className="size-5" />
                      <span>{selectedTable.waiter}</span>
                    </div>
                  )}
                </div>
              </ModalHeader>

              <ModalBody className="py-6">
                {selectedTable.orders.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No active orders</p>
                    <Button color="primary" className="mt-4">
                      Create New Order
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {selectedTable.orders.map((order: any) => {
                      const stats = getOrderStats(order);

                      return (
                        <div key={order.id} className="space-y-4">
                          {/* Order Header */}
                          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
                            <CardBody className="p-4">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <p className="text-xs text-gray-500 uppercase tracking-wide">Order ID</p>
                                  <p className="font-mono font-semibold">{order.id}</p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <HugeiconsIcon icon={ClockIcon} className="size-4 text-gray-500" />
                                    <span className="text-sm text-gray-600">
                                      Started at {formatTime(new Date(order.createdAt))}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                      ({getTimeSince(new Date(order.createdAt))})
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <Chip
                                    color={order.status === 'completed' ? 'success' : order.status === 'in_progress' ? 'warning' : 'primary'}
                                    variant="flat"
                                  >
                                    {order.status.replace('_', ' ').toUpperCase()}
                                  </Chip>
                                  <div className="mt-2">
                                    <p className="text-xs text-gray-500">Total Bill</p>
                                    <p className="text-2xl font-bold text-success flex items-center justify-end">
                                      <HugeiconsIcon icon={RupeeIcon} className="size-6" />
                                      {order.total.toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {order.notes && (
                                <div className="bg-white/50 rounded-lg p-3 mt-3">
                                  <p className="text-xs text-gray-500 uppercase mb-1">Special Notes</p>
                                  <p className="text-sm">{order.notes}</p>
                                </div>
                              )}

                              <div className="mt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Order Progress</span>
                                  <span className="font-semibold">
                                    {stats.completed} of {stats.total} items served
                                  </span>
                                </div>
                                <Progress
                                  value={stats.percentage}
                                  color={stats.percentage === 100 ? "success" : "warning"}
                                  className="h-2"
                                />
                              </div>
                            </CardBody>
                          </Card>

                          {/* Order Items */}
                          <div className="space-y-2">
                            <Tabs color="primary" variant="underlined">
                              <Tab key="all" title={`All Items (${order.items.length})`}>
                                <ScrollShadow className="max-h-96 space-y-2 mt-4">
                                  {order.items.map((item: any) => {
                                    const statusInfo = itemStatusConfig(item.status);
                                    return (
                                      <Card key={item.id} className="shadow-sm">
                                        <CardBody className="p-4">
                                          <div className="flex gap-4">
                                            {/*<div className="text-4xl">{item.menuItem.imageUrl}</div>*/}
                                            <div className="flex-1">
                                              <div className="flex justify-between items-start mb-2">
                                                <div>
                                                  <h4 className="font-bold text-lg">{item?.menuItem?.name}</h4>
                                                  <Chip size="sm" color="primary" variant="flat" className="mt-1">
                                                    {item?.menuItem?.category}
                                                  </Chip>
                                                </div>
                                                <Badge
                                                  content={
                                                    <HugeiconsIcon icon={statusInfo.icon} className="size-4" />
                                                  }
                                                  color={statusInfo.colour}
                                                  placement="top-right"
                                                >
                                                  <Chip color={statusInfo.colour} variant="flat">
                                                    {statusInfo.label}
                                                  </Chip>
                                                </Badge>
                                              </div>

                                              <div className="flex justify-between items-end mt-3">
                                                <div>
                                                  <p className="text-sm text-gray-600">Quantity: <span className="font-bold text-lg">{item.quantity}x</span></p>
                                                  {item.notes && (
                                                    <p className="text-xs text-gray-500 mt-1 italic">Note: {item.notes}</p>
                                                  )}
                                                </div>
                                                <div className="text-right">
                                                  <p className="text-xs text-gray-500">Item Total</p>
                                                  <p className="text-xl font-bold flex items-center">
                                                    <HugeiconsIcon icon={RupeeIcon} className="size-5" />
                                                    {(item.price * item.quantity).toFixed(2)}
                                                  </p>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </CardBody>
                                      </Card>
                                    );
                                  })}
                                </ScrollShadow>
                              </Tab>

                              <Tab
                                key="pending"
                                title={
                                  <div className="flex items-center gap-2">
                                    <span>Preparing</span>
                                    <Chip size="sm" color="warning" variant="flat">{stats.pending}</Chip>
                                  </div>
                                }
                              >
                                <ScrollShadow className="max-h-96 space-y-2 mt-4">
                                  {order.items.filter((i: any) => i.status === 'pending').map((item: any) => {
                                    const statusInfo = itemStatusConfig(item.status);
                                    return (
                                      <Card key={item.id} className="shadow-sm border-2 border-warning-200">
                                        <CardBody className="p-4">
                                          <div className="flex gap-4">
                                            <div className="text-4xl">{item.menuItem.imageUrl}</div>
                                            <div className="flex-1">
                                              <div className="flex justify-between items-start mb-2">
                                                <div>
                                                  <h4 className="font-bold text-lg">{item.menuItem.name}</h4>
                                                  <Chip size="sm" color="primary" variant="flat" className="mt-1">
                                                    {item.menuItem.category}
                                                  </Chip>
                                                </div>
                                                <Chip color="warning" variant="flat" startContent={<HugeiconsIcon icon={ChefHatIcon} className="size-4" />}>
                                                  In Kitchen
                                                </Chip>
                                              </div>
                                              <div className="flex justify-between items-end mt-3">
                                                <div>
                                                  <p className="text-sm text-gray-600">Quantity: <span className="font-bold text-lg">{item.quantity}x</span></p>
                                                  {item.notes && (
                                                    <p className="text-xs text-gray-500 mt-1 italic">Note: {item.notes}</p>
                                                  )}
                                                </div>
                                                <Button size="sm" color="success" variant="flat">
                                                  Mark as Served
                                                </Button>
                                              </div>
                                            </div>
                                          </div>
                                        </CardBody>
                                      </Card>
                                    );
                                  })}
                                </ScrollShadow>
                              </Tab>

                              <Tab
                                key="completed"
                                title={
                                  <div className="flex items-center gap-2">
                                    <span>Served</span>
                                    <Chip size="sm" color="success" variant="flat">{stats.completed}</Chip>
                                  </div>
                                }
                              >
                                <ScrollShadow className="max-h-96 space-y-2 mt-4">
                                  {order.items.filter((i: any) => i.status === 'completed').map((item: any) => (
                                    <Card key={item.id} className="shadow-sm opacity-75">
                                      <CardBody className="p-4">
                                        <div className="flex gap-4">
                                          <div className="text-4xl grayscale">{item.menuItem.imageUrl}</div>
                                          <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                              <div>
                                                <h4 className="font-bold text-lg text-gray-600">{item.menuItem.name}</h4>
                                                <p className="text-sm text-gray-500">Quantity: {item.quantity}x</p>
                                              </div>
                                              <Chip color="success" size="sm" startContent={<HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4" />}>
                                                Served
                                              </Chip>
                                            </div>
                                          </div>
                                        </div>
                                      </CardBody>
                                    </Card>
                                  ))}
                                </ScrollShadow>
                              </Tab>
                            </Tabs>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ModalBody>

              <ModalFooter className="border-t">
                <Button color="danger" variant="flat" onPress={() => setShowModal(false)}>
                  Close
                </Button>
                {selectedTable.orders.length > 0 && (
                  <>
                    <Button color="primary" variant="flat">
                      Add Items
                    </Button>
                    <Button color="success">
                      Complete Order
                    </Button>
                  </>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
