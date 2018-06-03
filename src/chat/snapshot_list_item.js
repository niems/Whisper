import React from 'react';
import './style/snapshot_list_item.css';

const SnapshotListItem = ({ channel }) => {
    return (
        <div className='snapshot-item-container'>
            <div className='snapshot-user-data'>
                <img className='snapshot-user-img' src={channel.image} alt='failed to load user/channel img' />
                <small className='snapshot-username'>{channel.displayName}</small>
            </div>

            <div className='snapshot-msg-data'>
                <div className='snapshot-msg'>
                    {channel.msg}
                </div>
                <small className='snapshot-timestamp'>{channel.timestamp}</small>
            </div>
            
            <span className='snapshot-expand-placeholder'></span>
            <img className='snapshot-expand-icon' src='./images/page_icons/arrow-right.svg' alt='failed to load resize img' />
        </div>
    );
}

export default SnapshotListItem;