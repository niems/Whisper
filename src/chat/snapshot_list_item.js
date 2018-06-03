import React from 'react';
import './style/snapshot_list_item.css';

const SnapshotListItem = ({ channel }) => {
    return (
        <li className='snapshot-item'>
            <div className='snapshot-item-container'>
                {channel.channelId}
            </div>
        </li>
    );
}

export default SnapshotListItem;