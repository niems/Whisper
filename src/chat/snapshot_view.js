import React from 'react';
import SnapshotListItem from './snapshot_list_item';
import './style/snapshot_view.css';

const SnapshotView = ({ snapshotMsgs }) => {

    const snapshotItems = snapshotMsgs.map( channel => (
        <SnapshotListItem id={channel.channelId} key={channel.channelId} channel={channel} />
    ));

    //if allMessages.length > 0: display snapshot, otherwise display no-message screen
    return (
        <div id='snapshot-view-container'>
            <h5 id='snapshot-title'>all messages</h5>            
            <div id='snapshot-view-list'>
                {snapshotItems}
            </div>
        </div>
    );
}

export default SnapshotView;