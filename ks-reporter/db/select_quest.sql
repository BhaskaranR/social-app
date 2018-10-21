--- insertion ------
delete from pricing.final_rewards where person_id = '599b3c4af83ee31c626b4376' and created_at between  '2017-08-21 00:00:00' and '2017-08-21 23:59:59';

select evt.action_id  from pricing.event_rewards evt join pricing.event_points  evtpts on evt.event_id = evtpts.id  where 
evt.action_id in
(select action_id from pricing.event_rewards evt where 
	evt.person = '599b3c4af83ee31c626b4376' and created_at between  '2017-08-21 00:00:00' and '2017-08-21 23:59:59') 
and evt.created_at between  '2017-08-21 00:00:00' and '2017-08-21 23:59:59'
and evtpts.reward_type = 'points'
group by evt.action_id order by sum(evtpts.reward_value) desc limit 20;

insert into pricing.final_rewards 
select evt.event_id, evt.action_id, evt.person, evtpts.reward_value, '', 'points' from 
 pricing.event_rewards evt join pricing.event_points evtpts on evt.event_id = evtpts.id 
 where evt.person = '599b3c4af83ee31c626b4376' and  evt.action_id in (
'599b6918ef4e161ac11bd05c'
'599b6c30ef4e161ac11bd060'
) and evt.created_at between  '2017-08-21 00:00:00' and '2017-08-21 23:59:59';


--- output (
    user, points
    )

-- repeat for owner --- 


-- secondary deletion ----

select * from pricing.event_rewards  where person = '' and action_id = '' and event_id = 23; -- get date

delete from pricing.event_rewards where person = '' and action_id = '' and event_id = 23;

delete from pricing.final_rewards where person_id = '599b3c4af83ee31c626b4376' and created_at between  'date' and 'date';

select evt.action_id  from pricing.event_rewards evt join pricing.event_points  evtpts on evt.event_id = evtpts.id  where 
evt.action_id in
(select action_id from pricing.event_rewards evt where 
	evt.person = '599b3c4af83ee31c626b4376' and created_at between  '2017-08-21 00:00:00' and '2017-08-21 23:59:59') 
and evt.created_at between  '2017-08-21 00:00:00' and '2017-08-21 23:59:59'
and evtpts.reward_type = 'points'
group by evt.action_id order by sum(evtpts.reward_value) desc limit 20;

insert into pricing.final_rewards 
select evt.event_id, evt.action_id, evt.person, evtpts.reward_value, '', 'points' from 
 pricing.event_rewards evt join pricing.event_points evtpts on evt.event_id = evtpts.id 
 where evt.person = '599b3c4af83ee31c626b4376' and  evt.action_id in (
'599b6918ef4e161ac11bd05c'
'599b6c30ef4e161ac11bd060'
) and evt.created_at between  '2017-08-21 00:00:00' and '2017-08-21 23:59:59';

--repeat for  owner ---


--- output (
    user, points
    )

---delete the primary ----

get all the action * dates related on the primary for the active month
delete from rewards table
calculate pricing for the dates again

--- output (
     user, points
    )

---------------------------------
