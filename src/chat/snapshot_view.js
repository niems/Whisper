import React from 'react';
import SnapshotListItem from './snapshot_list_item';
import './style/snapshot_view.css';

const SnapshotView = (props) => {
                /* snapshot channel properties:
                {
                    channelId: '#random',
                    displayName: '#random',
                    image: './image/image selected hereee',
                    msg: 'new message text',
                    timestamp: 'timestamp of newest message'
                }
                */
    let testList = [
        {
            channelId: '_kuhtah - _root',
            displayName: '_kuhtah',
            image: './images/user_images/cat-rain.gif',
            msg: 'BROOOOOOOOO, the rain is wet :o',
            timestamp: 'June 3rd @ 2:25PM'
        },
        {
            channelId: '_admin - _root',
            displayName: '_root',
            image: './images/user_images/rick.gif',
            msg: "This isn't a f****** chocolate factory",
            timestamp: 'June 3rd @ 2:21PM'
        },
        {
            channelId: '#random',
            displayName: '#random',
            image: './images/default_channel_icon.svg',
            msg: 'test message received from #random - will NOT actually specify channel this way',
            timestamp: 'June 3rd @ 2:15PM'
        },
        {
            channelId: '#general',
            displayName: '#general',
            image: './images/default_channel_icon.svg',
            msg: 'general message received - more testing with more typing to see how the <li> wraps correctly. It should use ... instead of running off the side :) ing with more typing to see how the <li> wraps correctly. It should use ... instead of running off the side :)',
            timestamp: 'June 3rd @ 2:05PM'
        }
    ];

    const snapshotItems = testList.map( channel => (
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