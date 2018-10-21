# ks-reporter

Little service to collect data from other services.



## Event logging
```
{
	entity: "posts",
	event_type: "view",
	entity_id: "643lkajsdl34j42lnnvhz23ml3",
	producer_id: "542laks2lk1231l4kjklkiii4",
	create_date: "2016-01-05T22:26:19.785Z"
}
```
#### entity
one of the following values:

* posts
* user
* video
* audio
* image
* conversation

#### event_type

* view
* favor
* unfavor
* follow
* unfollow
* create

#### entity_id
resource id (mongodb object id)

#### producer_id

user which has triggered the event

### Samples

User watches a video

```
{
	entity: "video",
	event_type: "view",
	entity_id: "643lkajsdl34j42lnnvhz23ml3",
	producer_id: "542laks2lk1231l4kjklkiii4",
	create_date: "2016-01-05T22:26:19.785Z"
}
```

User favors a posts

```
{
	entity: "posts",
	event_type: "favor",
	entity_id: "643lkajsdl34j42lnnvhz23ml3",
	producer_id: "542laks2lk1231l4kjklkiii4",
	create_date: "2016-01-05T22:26:19.785Z"
}
```

User follows a user

```
{
	entity: "user",
	event_type: "follow",
	entity_id: "643lkajsdl34j42lnnvhz23ml3",
	producer_id: "542laks2lk1231l4kjklkiii4",
	create_date: "2016-01-05T22:26:19.785Z"
}
```

User creates a conversation with another user

```
{
	entity: "conversation",
	event_type: "create",
	entity_id: "643lkajsdl34j42lnnvhz23ml3",
	producer_id: "542laks2lk1231l4kjklkiii4",
	create_date: "2016-01-05T22:26:19.785Z"
}
```
