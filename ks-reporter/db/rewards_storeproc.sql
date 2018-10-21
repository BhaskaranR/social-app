DROP PROCEDURE IF EXISTS pricing.CALCULATE_PRICING;

DELIMITER $$
CREATE PROCEDURE pricing.`CALCULATE_PRICING`(IN personId VARCHAR(45),
IN eventPointId int,
IN actionId VARCHAR(45)
)
BEGIN
	DECLARE curr_insertedDate DATE;
	DECLARE curr_eventID INT;
	DECLARE curr_person VARCHAR(45);
	DECLARE curr_created_at DATE;
    DECLARE ownerId VARCHAR(45);
    
    
    DECLARE exit handler for sqlexception
	  BEGIN
		drop table output_table;
	  ROLLBACK;
	END;

	DECLARE exit handler for sqlwarning
	 BEGIN
           select 'warning';
		drop table output_table;
	 ROLLBACK;
	END;
	SET ownerId = '';
    START TRANSACTION;
    BEGIN
		CREATE TEMPORARY TABLE output_table(person VARCHAR(45));
        
        -- Check if this is create event
		if(select count(*) >0 from event evt join event_points evtpts  on 
		evtpts.id = evt.event_id where evt.person != personId and evt.action_id = actionId and evtpts.event_name = 'create'  ) THEN
        BEGIN
			
            -- get the owner
			select evt.person into ownerId  from event evt join event_points evtpts  on 
			evtpts.id = evt.event_id where evt.person != personId and  evt.action_id = actionId and evtpts.event_name = 'create';
		END;
		END IF;
		
        -- insert into event
        INSERT INTO event (person, action_id, event_id) values (personId, actionId , eventPointId);
        
        -- positive action
 		if(SELECT reward_value >0 FROM event_points where id = eventPointId) THEN 
        BEGIN
			-- already awarded for the action
			-- if(select count(*) <= 0 from event_rewards evtrwds JOIN event evt 
			--	on evt.id = evtrwds.event_id
			--	 where evt.person = personId and evt.action_id = actionId) THEN
			-- BEGIN
				SET @last_id_in_table1 = LAST_INSERT_ID();
				INSERT INTO event_rewards(person, event_id) values (personId, @last_id_in_table1);
				
				delete from final_rewards where person_id= personId and DATE(created_date) =  CURDATE() AND reward_type = 'points';

				
				insert INTO final_rewards (event_id, action_id, person_id,  created_date, reward, reward_type)	
				SELECT evt.id, evt.action_id, evt.person, evt.created_at,  sum(evtpts.reward_value), evtpts.reward_type  from 
					pricing.event_rewards evtrwds LEFT OUTER JOIN pricing.event evt
					on  evt.id = evtrwds.event_id 
					JOIN pricing.event_points  evtpts on evt.event_id = evtpts.id
					WHERE evtrwds.person = personId AND 
					DATE(evt.created_at) = CURDATE() AND evtpts.reward_type = 'points'
					GROUP BY evt.action_id order by sum(evtpts.reward_value) desc limit 20;	
				

				insert into output_table values(personId);
				
				-- ASSIGN POINT TO THE OWNER OF THE POST
				IF ownerId != '' THEN
				BEGIN
					INSERT INTO event_rewards(person, event_id) values (ownerId, @last_id_in_table1);
					
					delete from final_rewards where person_id= ownerId and DATE(created_date) =  CURDATE() AND reward_type = 'points';


					insert INTO final_rewards (event_id, action_id, person_id,  created_date, reward, reward_type)	
					SELECT evt.id, evt.action_id, evt.person, evt.created_at,  sum(evtpts.reward_value), evtpts.reward_type  from 
					pricing.event_rewards evtrwds LEFT OUTER JOIN pricing.event evt
					on  evt.id = evtrwds.event_id 
					JOIN pricing.event_points  evtpts on evt.event_id = evtpts.id
					WHERE evtrwds.person = ownerId AND 
					DATE(evt.created_at) = CURDATE() AND evtpts.reward_type = 'points'
					GROUP BY evt.action_id order by sum(evtpts.reward_value) desc limit 20;
				
					insert into output_table values(ownerId);
				END;
				END IF;
			-- END;				
            -- END IF;
		END;
        ELSE
        BEGIN
			 SELECT distinct evt.id, DATE( evt.created_at) INTO curr_eventID, curr_insertedDate   from event evt join event_points evtpts 
				on evt.event_id = evtpts.id
                join event_rewards evtrwds on evt.id = evtrwds.event_id
				where evt.person = personId and evt.action_id = actionId and evtpts.event_name = (select REPLACE(event_name, 'delete-', '') from event_points evtpts1 
                where evtpts1.id = eventPointId);
       
            IF (ownerId != '' AND YEAR(curr_insertedDate) = YEAR(CURRENT_DATE()) AND MONTH(curr_insertedDate) = MONTH(CURRENT_DATE()))  THEN
			BEGIN

				DELETE FROM event_rewards where event_id = curr_eventID;
                
                DELETE FROM event where id = curr_eventID;
                
			

				
				DELETE FROM final_rewards where  DATE(created_date)=  DATE(curr_insertedDate) and person_id = personId AND reward_type = 'points';
				
                
                insert INTO final_rewards (event_id, action_id, person_id,  created_date, reward, reward_type)	
				SELECT evt.id, evt.action_id, evt.person, evt.created_at,  sum(evtpts.reward_value), evtpts.reward_type  from 
				pricing.event_rewards evtrwds LEFT OUTER JOIN pricing.event evt
                on  evt.id = evtrwds.event_id 
				JOIN pricing.event_points  evtpts on evt.event_id = evtpts.id
				WHERE evtrwds.person = personId AND 
                DATE(evt.created_at) = DATE(curr_insertedDate)  AND evtpts.reward_type = 'points'
				GROUP BY evt.action_id order by sum(evtpts.reward_value) desc limit 20;	
                
				
				insert into output_table values(personId);

				DELETE FROM final_rewards where  DATE(created_date)=  DATE(curr_insertedDate) and person_id = ownerId AND reward_type = 'points';

                insert INTO final_rewards (event_id, action_id, person_id,  created_date, reward, reward_type)	
                SELECT evt.id, evt.action_id, evt.person, evt.created_at,  sum(evtpts.reward_value), evtpts.reward_type  from 
				pricing.event_rewards evtrwds LEFT OUTER JOIN pricing.event evt
                on  evt.id = evtrwds.event_id 
				JOIN pricing.event_points  evtpts on evt.event_id = evtpts.id
				WHERE evtrwds.person = ownerId AND 
                DATE(evt.created_at) = DATE(curr_insertedDate)  AND evtpts.reward_type = 'points'
				GROUP BY evt.action_id order by sum(evtpts.reward_value) desc limit 20;	
                
				
				insert into output_table values(ownerId);
			END;
            ELSE
            BEGIN
				CREATE TEMPORARY TABLE IF NOT EXISTS 
				  temp_table
				ENGINE=MyISAM 
				AS (
					SELECT DISTINCT evtrwds.person, DATE(evt.created_at) `created_at`, 0 `valid`  from event_rewards evtrwds LEFT OUTER JOIN  event evt on evt.id = evtrwds.event_id  where evt.action_id = actionId and 
					YEAR(evt.created_at) = YEAR(CURRENT_DATE()) AND MONTH(evt.created_at) = MONTH(CURRENT_DATE())
				);
                
                  
				DELETE event_rewards from event_rewards
				LEFT OUTER JOIN  event evt on evt.id = event_rewards.event_id  where evt.action_id = actionId  and 
					YEAR(evt.created_at) = YEAR(CURRENT_DATE()) AND MONTH(evt.created_at) = MONTH(CURRENT_DATE());
				
                
				DELETE final_rewards from final_rewards  JOIN temp_table tt on tt.person = final_rewards.person_id
                where  DATE(final_rewards.created_date)=  DATE(tt.created_at) AND final_rewards.reward_type = 'points';
   
				-- recalculate 
				WHILE exists(Select `person` From temp_table Where `valid` = 0) Do
           
					Select `person`, `created_at` Into curr_person, curr_created_at From temp_table Where `valid` = 0 Limit 1;
             
					insert INTO final_rewards (event_id, action_id, person_id,  created_date, reward, reward_type)	
					SELECT evt.id, evt.action_id, evt.person, evt.created_at,  sum(evtpts.reward_value), evtpts.reward_type  from 
					pricing.event_rewards evtrwds LEFT OUTER JOIN pricing.event evt
					on  evt.id = evtrwds.event_id 
					JOIN pricing.event_points  evtpts on evt.event_id = evtpts.id
					WHERE evtrwds.person = curr_person AND 
					DATE(evt.created_at) = DATE(curr_created_at) AND evtpts.reward_type = 'points'
					GROUP BY evt.action_id order by sum(evtpts.reward_value) desc limit 20;	
				
						
					Update `temp_table` 
					Set `valid` = 1
					Where `person` = curr_person;
					
				END WHILE; 
				
				insert into output_table select person from temp_table;

				DROP TABLE temp_table; 
			END;
            END IF;
            
        END;
        END IF;
		
	END;
		select ot.person, sum(fr.reward)  from output_table ot JOIN final_rewards fr on ot.person = fr.person_id 
        where fr.reward_type = 'points';

		drop table output_table;
    COMMIT;
   
END$$
DELIMITER ;