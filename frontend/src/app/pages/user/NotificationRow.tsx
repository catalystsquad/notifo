/*
 * Notifo.io
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
 */

import classNames from 'classnames';
import * as React from 'react';
import ReactTooltip from 'react-tooltip';
import { Button, Nav, NavItem, NavLink, Table } from 'reactstrap';
import { FormatDate, Icon, JsonDetails } from '@app/framework';
import { UserNotificationChannelDto, UserNotificationDetailsDto } from '@app/service';
import { texts } from '@app/texts';

export interface NotificationRowProps {
    // The notification.
    notification: UserNotificationDetailsDto;
}

export const NotificationRow = React.memo((props: NotificationRowProps) => {
    const { notification } = props;

    const [isOpen, setIsOpen] = React.useState(0);

    React.useEffect(() => {
        ReactTooltip.rebuild();
    });
    
    const nonWebStatus = Object.entries(props.notification.channels).filter(x => x[0] !== 'web').map(x => x[1]);
    const numHandled = nonWebStatus.filter(x => !!Object.values(x.status).find(x => x.status === 'Handled')).length;
    const numFirstDelivered = nonWebStatus.filter(x => !!x.firstDelivered).length;
    const numFirstSeen = nonWebStatus.filter(x => !!x.firstSeen).length;
    const numFirstConfirmed = nonWebStatus.filter(x => !!x.firstConfirmed).length;

    return (
        <>
            <tr>
                <td>
                    <Button size='sm' color='link' onClick={() => setIsOpen(x => x === 0 ? 1 : 0)}>
                        <Icon type={isOpen ? 'expand_less' : 'expand_more'} />
                    </Button>
                </td>
                <td>
                    <span className='truncate'>{notification.subject}</span>
                </td>
                <td data-tip={texts.common.handled}>
                    {numHandled || '-'}
                </td>
                <td data-tip={texts.common.delivered}>
                    {numFirstDelivered || '-'}
                </td>
                <td data-tip={texts.common.seen}>
                    {numFirstSeen || '-'}
                </td>
                <td data-tip={texts.common.confirmed}>
                    {numFirstConfirmed || '-'}
                </td>
                <td className='text-right'>
                    <span className='truncate'>
                        <FormatDate format='Ppp' date={notification.created} />
                    </span>
                </td>
            </tr>

            {isOpen > 0 &&
                <>
                    <tr className='user-notification-header'>
                        <td className='no-padding bordered' colSpan={7}>
                            <Nav className='nav-tabs2'>
                                <NavItem>
                                    <NavLink active={isOpen === 1} onClick={() => setIsOpen(1)}>
                                        {texts.common.overview}
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink active={isOpen === 2} onClick={() => setIsOpen(2)}>
                                        JSON
                                    </NavLink>
                                </NavItem>
                            </Nav>
                        </td>
                    </tr>
                    <tr className='user-notification-details'>
                        <td className={classNames('bordered', { 'no-padding': isOpen === 2 })} colSpan={7}>
                            {isOpen === 1 ? (
                                <div>
                                    <Table className='user-notification-settings' size='sm'>
                                        <thead>
                                            <tr aria-colspan={5}>
                                                <th>{texts.common.settings}</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {Object.entries(notification.channels).map(([key, channel]) =>
                                                <tr key={key}>
                                                    <td>
                                                        {texts.common.sendModes[channel.setting.send]}
                                                    </td>
                                                    <td>
                                                        {texts.common.via}
                                                    </td>
                                                    <td>
                                                        {texts.notificationSettings[key]?.title}
                                                    </td>
                                                    <td>
                                                        {texts.common.after}
                                                    </td>
                                                    <td className='text-right'>
                                                        {channel.setting.delayInSeconds || 0}
                                                    </td>
                                                    <td>
                                                        {texts.common.secondsShort}
                                                    </td>
                                                    <td>
                                                        {texts.common.when}
                                                    </td>
                                                    <td>
                                                        {channel.setting.condition === 'Inherit' ?  texts.common.conditionModes.Always : texts.common.conditionModes[channel.setting.condition]}
                                                    </td>
                                                </tr>,
                                            )}

                                        </tbody>                                        
                                    </Table>
                                    
                                    <Table className='user-notification-status' size='sm'>
                                        <thead>
                                            <tr>
                                                <th>{texts.common.channel}</th>
                                                <th>{texts.common.firstDelivered}</th>
                                                <th>{texts.common.firstSeen}</th>
                                                <th>{texts.common.firstConfirmed}</th>
                                                <th>{texts.common.status}</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {Object.entries(notification.channels).map(([key, channel]) =>
                                                <tr key={key}>
                                                    <td>
                                                        {texts.notificationSettings[key]?.title}
                                                    </td>
                                                    <td>
                                                        <FormatDate format='Ppp' date={channel.firstDelivered} />
                                                    </td>
                                                    <td>
                                                        <FormatDate format='Ppp' date={channel.firstSeen} />
                                                    </td>
                                                    <td>
                                                        <FormatDate format='Ppp' date={channel.firstConfirmed} />
                                                    </td>
                                                    <td>
                                                        {getStatus(channel)}
                                                    </td>
                                                </tr>,
                                            )}
                                        </tbody>
                                    </Table>
                                </div>
                            ) : (
                                <JsonDetails object={notification} />
                            )}
                        </td>
                    </tr>
                </>

            }
        </>
    );
});

function getStatus(channel: UserNotificationChannelDto) {
    const status: { [name: string]: boolean } = {};

    for (const value of Object.values(channel.status)) {
        status[value.status || 'None'] = true;
    }

    if (Object.keys(status).length === 0) {
        status['None'] = true;
    }

    return Object.keys(status).sortByString(x => x).join(', ');
}
