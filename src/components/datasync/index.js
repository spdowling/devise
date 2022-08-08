// @ts-check

export { CommitController } from './commit-controller';
export { FolioCommitLogElement } from './commit-log';

// // NOTE(spdowling) handler for websocket outbound messages
// async sync(messages): trigger send and receive from remote
//      const result = await post(messages);
//      receive(result.messages);

// // NOTE(spdowling) handler for websocket inbound messages
// receive(messages): consume inbound messages
//      apply(messages);

// // NOTE(spdowling) process message against instance local db
// apply(messages): 
//      const existing = compare(messages);
//      for msg of messages
//          if !existing.get(msg); idb.set(msg);

// // NOTE(spdowling) trigger local apply before outbound update
// send(messages):
//      apply(messages);
//      sync(messages);

// // NOTE(spdowling) handle inbound messages and store ?
// // do we need to assume online? when we trigger a send, we need to make sure
// // that we store first, then really we deal with attempting to send, otherwise
// // we send it later ... if we are offline, what do we do? store in a queue?
// // or instead track which messages have been sent? and then we can trigger
// // only what we need to when syncing to remote
// websocket.onmessage => receive(message);

// we can sync with a 'since' to filter what to send ... would that provide us
// with a way to  handle offline activity that needs updating?

// how do we ensure receive vs send and in what order ?

// seems like crdt-example will calculate the diffTime, which is the merkle
// result compared to the current clock.merkle result. if there is any diffTime
// then trigger retrieving messages from db according to diffTime
// then send items ...

// so is that then ensuring consistent updates of any messages that occurred
// in between? feels like it.
