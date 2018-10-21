DROP PROCEDURE IF EXISTS pricing.GetTrending;

DELIMITER $$
CREATE PROCEDURE `pricing`.`GetTrending`(
IN postType VARCHAR(45)
)

BEGIN

	if (postType = 'all') THEN
    BEGIN
		SELECT trending.action_id as postId , evt2.person as userId,  oldinweeks as oldInWeeks, 
			if(oldinweeks >1, LOG(max(trending.sumRwdVal)) * EXP(-8*(oldinweeks-1)*(oldinweeks-1)),  LOG(max(trending.sumRwdVal))) score
			from 
			(SELECT evt.action_id, sum(evtpts.reward_value) sumRwdVal,
			 ROUND(DATEDIFF(current_date(),  DATE(evt.created_at))/7, 0) oldinweeks
			 from pricing.event_rewards evtrwds join pricing.event  evt 
             on evtrwds.event_id = evt.id
				JOIN pricing.event_points  evtpts on evt.event_id = evtpts.id
				WHERE evtpts.reward_type = 'points'
				AND evtpts.event_category = 'post'
				GROUP BY evt.action_id order by sum(evtpts.reward_value)) trending JOIN
			event evt2 on trending.action_id =evt2.action_id JOIN pricing.event_points evtpts2 on evt2.event_id = evtpts2.id
            and evtpts2.event_name = 'create'
			GROUP BY trending.action_id
            ORDER BY score desc;
	END;
    ELSE
    BEGIN
    
    SELECT trending.action_id as postId, evt2.person as userId,  oldinweeks as oldInWeeks, 
			if(oldinweeks >1, LOG(max(trending.sumRwdVal)) * EXP(-8*(oldinweeks-1)*(oldinweeks-1)),  LOG(max(trending.sumRwdVal))) score
			from 
			(SELECT evt.action_id, sum(evtpts.reward_value) sumRwdVal,
			 ROUND(DATEDIFF(current_date(),  DATE(evt.created_at))/7, 0) oldinweeks
			 from pricing.event_rewards evtrwds join pricing.event  evt 
             on evtrwds.event_id = evt.id
				JOIN pricing.event_points  evtpts on evt.event_id = evtpts.id
				WHERE evtpts.reward_type = 'points'
				AND evt.action_id in (select action_id from pricing.event evt1 join pricing.event_points evtpts1 on evt1.event_id = evtpts1.id 
									and evtpts1.event_name='create' AND evtpts1.event_category = 'post' and event_subcategory LIKE CONCAT('%', postType , '%'))					
                                    GROUP BY evt.action_id order by sum(evtpts.reward_value)) trending JOIN
			event evt2 on trending.action_id =evt2.action_id JOIN pricing.event_points evtpts2 on evt2.event_id = evtpts2.id
            and evtpts2.event_name = 'create'
			GROUP BY trending.action_id
            ORDER BY score desc;
   
	END;
    END IF;


END$$
DELIMITER ;