/*
 * Notifo.io
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
 */

import * as React from 'react';
import { useDispatch } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import { Button, Card, CardBody, Col, Nav, NavItem, NavLink, Row, Table } from 'reactstrap';
import { FormError, Icon, ListPager, ListSearch, Loader, Query, useDialog } from '@app/framework';
import { SubscriptionDto } from '@app/service';
import { deleteSubscription, loadSubscriptions, togglePublishDialog, useApp, useSubscriptions } from '@app/state';
import { texts } from '@app/texts';
import { SubscriptionDialog } from './SubscriptionDialog';
import { SubscriptionRow } from './SubscriptionRow';

export interface SubscriptionsProps {
    // The user id.
    userId: string;

    // Toggled when switched to other tab.
    onSwitch?: () => void;
}

export const Subscriptions = (props: SubscriptionsProps) => {
    const { onSwitch, userId } = props;

    const dispatch = useDispatch();
    const app = useApp()!;
    const appId = app.id;
    const dialogEdit = useDialog();
    const dialogNew = useDialog();
    const subscriptions = useSubscriptions(x => x.subscriptions);
    const [editSubscription, setEditSubscription] = React.useState<SubscriptionDto>();

    React.useEffect(() => {
        ReactTooltip.rebuild();
    });

    React.useEffect(() => {
        dispatch(loadSubscriptions(appId, userId, {}));
    }, [dispatch, appId, userId]);

    const doRefresh = React.useCallback(() => {
        dispatch(loadSubscriptions(appId, userId));
    }, [dispatch, appId, userId]);

    const doLoad = React.useCallback((q?: Partial<Query>) => {
        dispatch(loadSubscriptions(appId, userId, q));
    }, [dispatch, appId, userId]);

    const doDelete = React.useCallback((subscription: SubscriptionDto) => {
        dispatch(deleteSubscription({ appId, userId, topicPrefix: subscription.topicPrefix }));
    }, [dispatch, appId, userId]);

    const doPublish = React.useCallback((subscription: SubscriptionDto) => {
        dispatch(togglePublishDialog({ open: true, values: { topic: subscription.topicPrefix } }));
    }, [dispatch]);

    const doEdit = React.useCallback((subscription: SubscriptionDto) => {
        dialogEdit.open();

        setEditSubscription(subscription);
    }, [dialogEdit]);

    return (
        <>
            <Row className='align-items-center header'>
                <Col xs={12} lg={6}>
                    <Row className='align-items-center flex-nowrap'>
                        <Col className='no-overflow'>
                            <Nav className='nav-tabs2'>
                                <NavItem>
                                    <NavLink onClick={onSwitch}>
                                        {texts.notifications.header}
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink active>
                                        {texts.subscriptions.header}
                                    </NavLink>
                                </NavItem>
                            </Nav>
                        </Col>
                        <Col xs='auto' className='col-refresh'>
                            {subscriptions.isLoading ? (
                                <Loader visible={subscriptions.isLoading} />
                            ) : (
                                <Button color='blank' size='sm' className='btn-flat' onClick={doRefresh} data-tip={texts.common.refresh}>
                                    <Icon className='text-lg' type='refresh' />
                                </Button>
                            )}
                        </Col>
                    </Row>
                </Col>
                <Col xs={12} lg={6}>
                    <Row noGutters>
                        <Col>
                            <ListSearch list={subscriptions} onSearch={doLoad} placeholder={texts.subscriptions.searchPlaceholder} />
                        </Col>
                        <Col xs='auto pl-2'>
                            <Button color='success' onClick={dialogNew.open}>
                                <Icon type='add' /> {texts.subscriptions.createButton}
                            </Button>
                        </Col>
                    </Row>
                </Col>
            </Row>

            <FormError error={subscriptions.error} />

            {dialogNew.isOpen &&
                <SubscriptionDialog userId={userId} onClose={dialogNew.close} />
            }

            <Card className='card-table'>
                <CardBody>
                    <Table className='table-fixed table-simple table-middle'>
                        <colgroup>
                            <col />
                            <col style={{ width: 170 }} />
                        </colgroup>

                        <thead>
                            <tr>
                                <th>
                                    <span className='truncate'>{texts.common.topic}</span>
                                </th>
                                <th className='text-right'>
                                    <span className='truncate'>{texts.common.actions}</span>
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {subscriptions.items &&
                                <>
                                    {subscriptions.items.map(subscription => (
                                        <SubscriptionRow key={subscription.topicPrefix} subscription={subscription}
                                            onPublish={doPublish}
                                            onDelete={doDelete}
                                            onEdit={doEdit}
                                        />
                                    ))}
                                </>
                            }

                            {subscriptions.isLoaded && subscriptions.items && subscriptions.items.length === 0 &&
                                <tr>
                                    <td colSpan={4}>{texts.subscriptions.subscriptionsNotFound}</td>
                                </tr>
                            }
                        </tbody>
                    </Table>
                </CardBody>
            </Card>

            <ListPager list={subscriptions} onChange={doLoad} />

            {dialogEdit.isOpen &&
                <SubscriptionDialog userId={userId} subscription={editSubscription} onClose={dialogEdit.close} />
            }
        </>
    );
};
